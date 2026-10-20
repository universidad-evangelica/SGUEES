using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    // Qué hace: pestaña Archivos de la solicitud de beca.
    // Cómo lo hace: lee V_ACA_PROSPECTO_BECA_ARCHIVO y reemplaza el documento en la carpeta del ciclo.
    public class ACA_PROSPECTO_BECA_ARCHIVOService : IACA_PROSPECTO_BECA_ARCHIVOService
    {
        // Carpeta del servidor de admisiones. Z:\Documentacion Becas apunta a esta ruta.
        private const string RaizDocumentos = @"\\192.168.1.8\admision\Documentacion Becas";

        private readonly IACA_PROSPECTO_BECA_ARCHIVORepository _repo;
        private readonly string _connectionString;

        public ACA_PROSPECTO_BECA_ARCHIVOService(IACA_PROSPECTO_BECA_ARCHIVORepository repo, IConfiguration config)
        {
            _repo = repo;
            _connectionString = config.GetConnectionString("defaultConnection");
        }

        // Qué hace: archivos cargados de la solicitud, agrupables por sección del cuestionario.
        // Cómo lo hace: filtra la vista por empresa y solicitud.
        public async Task<CResult> GetArchivosAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO_BECA <= 0)
                return Error("Debe indicar la solicitud de beca");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO_BECA", Value = xWhere.CORR_PROSPECTO_BECA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetArchivosAsync(p);
        }

        // Qué hace: abre el archivo de una respuesta desde la carpeta del ciclo y la solicitud.
        // Cómo lo hace: no usa la ruta que mande el navegador. La toma de la respuesta y solo
        //               acepta un archivo dentro de Documentacion Becas\{año}-{período}_{solicitud}.
        public async Task<AcaProspectoBecaArchivoAbierto> AbrirArchivoAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO_BECA <= 0 || xWhere.CORR_RESPUESTA_BECA <= 0)
                return new AcaProspectoBecaArchivoAbierto();

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO_BECA", Value = xWhere.CORR_PROSPECTO_BECA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RESPUESTA_BECA", Value = xWhere.CORR_RESPUESTA_BECA, DbType = System.Data.DbType.Int32 },
            };

            var resultado = await _repo.GetArchivoAsync(p);
            var row = (resultado.Data as List<ACA_PROSPECTO_BECA_ARCHIVOView>)?.FirstOrDefault();
            var ruta = ResolverRuta(row);
            if (ruta == null)
                return new AcaProspectoBecaArchivoAbierto();

            return new AcaProspectoBecaArchivoAbierto
            {
                Stream = new FileStream(ruta, FileMode.Open, FileAccess.Read, FileShare.Read),
                ContentType = ContentType(row.ARCHIVO_NOMBRE),
            };
        }

        // Qué hace: reemplaza el archivo de una respuesta de tipo documento.
        // Cómo lo hace: lo guarda en la carpeta del ciclo y la solicitud, con el mismo
        //               nombre {pregunta}_{archivo} que usa el formulario de admisión.
        public async Task<CResult> ReemplazarArchivoAsync(int corrEmpresa, string usuario, int corrProspectoBeca, int corrRespuestaBeca, IFormFile archivo)
        {
            if (corrProspectoBeca <= 0 || corrRespuestaBeca <= 0 || archivo == null || archivo.Length == 0)
                return Error("Seleccione un archivo");
            if (archivo.Length > 5 * 1024 * 1024)
                return Error("El archivo no puede superar 5 MB");

            var extension = Path.GetExtension(archivo.FileName ?? "").ToLowerInvariant();
            if (extension != ".pdf" && extension != ".jpg" && extension != ".jpeg" && extension != ".png" && extension != ".webp")
                return Error("Solo se permiten archivos PDF, JPG, PNG o WEBP");

            await using var cn = new SqlConnection(_connectionString);
            await cn.OpenAsync();

            int corrPregunta;
            string carpeta;
            await using (var cmd = cn.CreateCommand())
            {
                cmd.CommandText = @"
                    SELECT P.CORR_PREGUNTA_BECA, P.TIPO_RESPUESTA,
                           CAST(PA.ANIO AS varchar(4)) + '-' + CAST(PA.NUMERO_PERIODO AS varchar(2)) + '_' + CAST(PB.CORR_PROSPECTO_BECA AS varchar(12))
                    FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                    INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
                    INNER JOIN dbo.ACA_PROSPECTO_BECA PB ON PB.CORR_PROSPECTO_BECA = R.CORR_PROSPECTO_BECA
                    INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = PB.CORR_PERIODO_ACADEMICO
                    WHERE R.CORR_RESPUESTA_BECA = @Respuesta
                      AND R.CORR_PROSPECTO_BECA = @Solicitud
                      AND PB.CORR_EMPRESA = @Empresa
                      AND PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA');";
                cmd.Parameters.Add(new SqlParameter("@Respuesta", corrRespuestaBeca));
                cmd.Parameters.Add(new SqlParameter("@Solicitud", corrProspectoBeca));
                cmd.Parameters.Add(new SqlParameter("@Empresa", corrEmpresa));
                await using var rd = await cmd.ExecuteReaderAsync();
                if (!await rd.ReadAsync())
                    return Error("No se encontró el archivo de esta solicitud");
                if (!string.Equals(rd.GetString(1), "DOCUMENTO", StringComparison.OrdinalIgnoreCase))
                    return Error("Esta respuesta no es un documento");
                corrPregunta = rd.GetInt32(0);
                carpeta = rd.GetString(2);
            }

            var raiz = Path.GetFullPath(RaizDocumentos);
            var directorio = Path.GetFullPath(Path.Combine(raiz, carpeta));
            if (!EstaDentro(directorio, raiz))
                return Error("La carpeta del archivo no es válida");

            var nombre = corrPregunta + "_" + LimpiarNombre(Path.GetFileNameWithoutExtension(archivo.FileName)) + extension;
            if (nombre.Length > 255)
                return Error("El nombre del archivo es demasiado largo");

            Directory.CreateDirectory(directorio);
            var destino = Path.GetFullPath(Path.Combine(directorio, nombre));
            if (!EstaDentro(destino, directorio))
                return Error("El nombre del archivo no es válido");

            await using (var stream = new FileStream(destino, FileMode.Create, FileAccess.Write, FileShare.None))
                await archivo.CopyToAsync(stream);

            try
            {
                await using var tx = (SqlTransaction)await cn.BeginTransactionAsync();
                await using var update = cn.CreateCommand();
                update.Transaction = tx;
                update.CommandText = @"
                    UPDATE dbo.ACA_PROSPECTO_BECA_RESPUESTA
                    SET ARCHIVO_NOMBRE = @Nombre,
                        ARCHIVO_RUTA = @Ruta,
                        RESPUESTA_TEXTO = @Nombre,
                        USUARIO_ACTU = @Usuario,
                        ESTACION_ACTU = @Estacion,
                        FECHA_ACTU = GETDATE()
                    WHERE CORR_RESPUESTA_BECA = @Respuesta
                      AND CORR_PROSPECTO_BECA = @Solicitud;";
                update.Parameters.Add(new SqlParameter("@Nombre", nombre));
                update.Parameters.Add(new SqlParameter("@Ruta", destino));
                update.Parameters.Add(new SqlParameter("@Usuario", usuario));
                update.Parameters.Add(new SqlParameter("@Estacion", Environment.MachineName.Length > 30 ? Environment.MachineName.Substring(0, 30) : Environment.MachineName));
                update.Parameters.Add(new SqlParameter("@Respuesta", corrRespuestaBeca));
                update.Parameters.Add(new SqlParameter("@Solicitud", corrProspectoBeca));
                await update.ExecuteNonQueryAsync();
                await tx.CommitAsync();
            }
            catch
            {
                if (File.Exists(destino))
                    File.Delete(destino);
                throw;
            }

            foreach (var anterior in Directory.GetFiles(directorio, corrPregunta + "_*"))
            {
                if (!string.Equals(Path.GetFullPath(anterior), destino, StringComparison.OrdinalIgnoreCase))
                    File.Delete(anterior);
            }

            return new CResult { Result = true, Data = nombre, ErrorMessage = "Archivo actualizado" };
        }

        private static string ResolverRuta(ACA_PROSPECTO_BECA_ARCHIVOView row)
        {
            if (row == null || row.NUMERO_PERIODO == null)
                return null;

            var raiz = Path.GetFullPath(RaizDocumentos);
            var carpeta = row.ANIO + "-" + row.NUMERO_PERIODO + "_" + row.CORR_PROSPECTO_BECA;
            var directorio = Path.GetFullPath(Path.Combine(raiz, carpeta));
            if (!EstaDentro(directorio, raiz))
                return null;

            var nombre = Path.GetFileName(row.ARCHIVO_NOMBRE ?? "");
            if (string.IsNullOrWhiteSpace(nombre))
                return null;

            var porNombre = Path.GetFullPath(Path.Combine(directorio, nombre));
            if (EstaDentro(porNombre, directorio) && File.Exists(porNombre))
                return porNombre;

            if (!string.IsNullOrWhiteSpace(row.ARCHIVO_RUTA))
            {
                var porRuta = Path.GetFullPath(row.ARCHIVO_RUTA);
                if (string.Equals(Path.GetFileName(porRuta), nombre, StringComparison.OrdinalIgnoreCase)
                    && EstaDentro(porRuta, directorio)
                    && File.Exists(porRuta))
                    return porRuta;
            }

            return null;
        }

        private static bool EstaDentro(string ruta, string carpeta)
        {
            var sep = Path.DirectorySeparatorChar;
            var baseDir = carpeta.TrimEnd(sep) + sep;
            return ruta.StartsWith(baseDir, StringComparison.OrdinalIgnoreCase);
        }

        private static string ContentType(string nombre)
        {
            switch (Path.GetExtension(nombre ?? "").ToLowerInvariant())
            {
                case ".pdf": return "application/pdf";
                case ".jpg":
                case ".jpeg": return "image/jpeg";
                case ".png": return "image/png";
                case ".webp": return "image/webp";
                case ".gif": return "image/gif";
                case ".doc": return "application/msword";
                case ".docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                default: return "application/octet-stream";
            }
        }

        private static string LimpiarNombre(string nombre)
        {
            var limpio = new string((nombre ?? "archivo").Where(c => char.IsLetterOrDigit(c) || c == ' ' || c == '-' || c == '_').ToArray()).Trim();
            if (string.IsNullOrWhiteSpace(limpio))
                limpio = "archivo";
            return limpio.Length > 80 ? limpio.Substring(0, 80) : limpio;
        }

        private static CResult Error(string mensaje)
        {
            return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = mensaje };
        }
    }
}
