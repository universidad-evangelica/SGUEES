using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using System.Data;
using System.Text.RegularExpressions;
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
        private readonly string RaizDocumentos = @"\\192.168.1.8\admision\Documentacion Becas";

        private readonly IACA_PROSPECTO_BECA_ARCHIVORepository _repo;

        public ACA_PROSPECTO_BECA_ARCHIVOService(IACA_PROSPECTO_BECA_ARCHIVORepository repo, IConfiguration config)
        {
            _repo = repo;
            RaizDocumentos = config["Becas:RaizDocumentos"] ?? RaizDocumentos;
        }

        // Qué hace: archivos cargados de la solicitud, agrupables por sección del cuestionario.
        // Cómo lo hace: filtra la vista por empresa y solicitud.
        public async Task<CResult> GetArchivosAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_PROSPECTO_BECA <= 0)
                return Error("Debe indicar la solicitud de beca");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO_BECA", Value = xWhere.CORR_PROSPECTO_BECA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetArchivosAsync(p);
        }

        // Qué hace: abre el archivo de una respuesta desde su ubicacion registrada.
        // Cómo lo hace: no usa la ruta que mande el navegador. La toma de la respuesta
        //               autorizada y solo acepta archivos dentro de Documentacion Becas.
        public async Task<AcaProspectoBecaArchivoAbierto> AbrirArchivoAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_PROSPECTO_BECA <= 0 || xWhere.CORR_RESPUESTA_BECA <= 0)
                return new AcaProspectoBecaArchivoAbierto();

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO_BECA", Value = xWhere.CORR_PROSPECTO_BECA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_RESPUESTA_BECA", Value = xWhere.CORR_RESPUESTA_BECA, DbType = System.Data.DbType.Int32 },
            };

            var resultado = await _repo.GetArchivoAsync(p);
            if (!resultado.Result) throw new InvalidOperationException(resultado.ErrorMessage);
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


        // Sustituye el documento dentro de la carpeta ciclo_CIF que ya creo admision.
        public async Task<CResult> ReemplazarArchivoAsync(int corrEmpresa, string usuario, int corrProspectoBeca, int corrRespuestaBeca, IFormFile archivo)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(usuario)) return Error("Sesion invalida");
            if (corrProspectoBeca <= 0 || corrRespuestaBeca <= 0 || archivo == null || archivo.Length == 0)
                return Error("Seleccione un archivo");
            if (archivo.Length > 5 * 1024 * 1024) return Error("El archivo no puede superar 5 MB");
            var extension = Path.GetExtension(archivo.FileName ?? "").ToLowerInvariant();
            if (extension != ".pdf" && extension != ".jpg" && extension != ".jpeg" && extension != ".png" && extension != ".webp")
                return Error("Solo se permiten archivos PDF, JPG, PNG o WEBP");

            var filtros = ParametrosArchivo(corrEmpresa, corrProspectoBeca, corrRespuestaBeca);
            var contexto = await _repo.GetContextoArchivoAsync(filtros);
            if (!contexto.Result) return contexto;
            var row = (contexto.Data as List<ACA_PROSPECTO_BECA_ARCHIVO_EDICIONView>)?.SingleOrDefault();
            if (row == null) return Error("El documento no pertenece a esta solicitud o no permite modificaciones");
            var directorio = ResolverDirectorio(row.CARPETA);
            if (directorio == null) return Error("No existe la carpeta de ciclo y CIF creada por SIS_ADMISION. No se creo otra carpeta");

            // Un nombre unico evita sobrescribir el original antes de confirmar la base.
            var nombre = row.CORR_PREGUNTA_BECA + "_" + Guid.NewGuid().ToString("N") + "_" + LimpiarNombre(Path.GetFileNameWithoutExtension(archivo.FileName)) + extension;
            var destino = Path.GetFullPath(Path.Combine(directorio, nombre));
            if (!EstaDentro(destino, directorio) || nombre.Length > 255 || destino.Length > 500)
                return Error("El nombre o la ruta del archivo no son validos");
            var creado = false;
            var eliminarNuevo = true;
            try
            {
                await using (var stream = new FileStream(destino, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, FileOptions.Asynchronous))
                {
                    creado = true;
                    await archivo.CopyToAsync(stream);
                }
                var parametros = new List<CParameter>
                {
                    new() { ParameterName="@CORR_EMPRESA", Value=corrEmpresa, DbType=DbType.Int32 },
                    new() { ParameterName="@SOLICITUD", Value=corrProspectoBeca, DbType=DbType.Int32 },
                    new() { ParameterName="@RESPUESTA", Value=corrRespuestaBeca, DbType=DbType.Int32 },
                    new() { ParameterName="@NOMBRE", Value=nombre, DbType=DbType.AnsiString, Size=255 },
                    new() { ParameterName="@RUTA", Value=destino, DbType=DbType.AnsiString, Size=500 },
                    new() { ParameterName="@RUTA_ANTERIOR", Value=(object)row.ARCHIVO_RUTA ?? DBNull.Value, DbType=DbType.AnsiString, Size=500 },
                    new() { ParameterName="@NOMBRE_ANTERIOR", Value=(object)row.ARCHIVO_NOMBRE ?? DBNull.Value, DbType=DbType.AnsiString, Size=255 },
                    new() { ParameterName="@USUARIO", Value=usuario.Trim().Substring(0, Math.Min(usuario.Trim().Length,30)), DbType=DbType.AnsiString, Size=30 },
                    new() { ParameterName="@ESTACION", Value=Environment.MachineName.Substring(0,Math.Min(Environment.MachineName.Length,30)), DbType=DbType.AnsiString, Size=30 },
                };
                // Si se pierde la confirmacion, no borrar un archivo que pudiera haberse guardado.
                eliminarNuevo = false;
                var guardado = await _repo.GuardarArchivoAsync(parametros);
                if (!guardado.Result)
                {
                    var verificacion = await _repo.GetContextoArchivoAsync(filtros);
                    if (!verificacion.Result) return guardado;
                    var actual = (verificacion.Data as List<ACA_PROSPECTO_BECA_ARCHIVO_EDICIONView>)?.SingleOrDefault();
                    if (actual == null || !string.Equals(actual.ARCHIVO_RUTA, destino, StringComparison.OrdinalIgnoreCase)
                        || !string.Equals(actual.ARCHIVO_NOMBRE, nombre, StringComparison.OrdinalIgnoreCase))
                    {
                        eliminarNuevo = true;
                        return guardado;
                    }
                }
                // El original se conserva para recuperacion; no se borran archivos por patron.
                return new CResult { Result=true, Data=nombre, RowsAffected=1, ErrorMessage="Archivo actualizado" };
            }
            catch (UnauthorizedAccessException) { return Error("No se tiene permiso para escribir en la carpeta del documento"); }
            catch (IOException) { return Error("No se pudo escribir el documento. Verifique la disponibilidad de la carpeta compartida"); }
            finally
            {
                if (creado && eliminarNuevo)
                {
                    try { File.Delete(destino); }
                    catch (IOException) { }
                    catch (UnauthorizedAccessException) { }
                }
            }
        }

        private static List<CParameter> ParametrosArchivo(int empresa, int solicitud, int respuesta)
            => new()
            {
                new() { ParameterName="CORR_EMPRESA", Value=empresa, DbType=DbType.Int32 },
                new() { ParameterName="CORR_PROSPECTO_BECA", Value=solicitud, DbType=DbType.Int32 },
                new() { ParameterName="CORR_RESPUESTA_BECA", Value=respuesta, DbType=DbType.Int32 },
            };

        private string ResolverDirectorio(string carpeta)
        {
            if (string.IsNullOrWhiteSpace(carpeta) || !Regex.IsMatch(carpeta, @"^\d{4}-\d{1,2}_\d+$")) return null;
            var raiz = Path.GetFullPath(RaizDocumentos);
            var directorio = Path.GetFullPath(Path.Combine(raiz, carpeta));
            return EstaDentro(directorio, raiz) && Directory.Exists(directorio) ? directorio : null;
        }

        private string ResolverRuta(ACA_PROSPECTO_BECA_ARCHIVOView row)
        {
            if (row == null) return null;
            var directorio = ResolverDirectorio(row.CARPETA);
            var nombre = Path.GetFileName(row.ARCHIVO_NOMBRE ?? "");
            if (directorio == null || string.IsNullOrWhiteSpace(nombre)) return null;
            // Se conserva la ruta registrada si apunta a la misma carpeta ciclo_CIF.
            if (!string.IsNullOrWhiteSpace(row.ARCHIVO_RUTA))
            {
                var registrada = Path.GetFullPath(row.ARCHIVO_RUTA);
                if (string.Equals(Path.GetDirectoryName(registrada), directorio, StringComparison.OrdinalIgnoreCase)
                    && string.Equals(Path.GetFileName(registrada), nombre, StringComparison.OrdinalIgnoreCase) && File.Exists(registrada))
                    return registrada;
            }
            // Recupera rutas con letra local del servidor usando el mismo ciclo_CIF y nombre.
            var ruta = Path.GetFullPath(Path.Combine(directorio, nombre));
            return EstaDentro(ruta, directorio) && File.Exists(ruta) ? ruta : null;
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
