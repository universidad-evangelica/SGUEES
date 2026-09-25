using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_BECAService : IACA_PROSPECTO_BECAService
    {
        // Carpeta del servidor de admisiones. Z:\Documentacion Becas apunta a esta ruta.
        private const string RaizDocumentos = @"\\192.168.1.8\admision\Documentacion Becas";

        private readonly IACA_PROSPECTO_BECARepository _repo;

        public ACA_PROSPECTO_BECAService(IACA_PROSPECTO_BECARepository repo)
        {
            _repo = repo;
        }

        // Qué hace: solicitudes de beca de un ciclo, en borrador o enviadas.
        // Cómo lo hace: exige el ciclo porque eFramework omite del WHERE los enteros en 0.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.ANIO <= 0 || xWhere.NUMERO_PERIODO <= 0)
                return Error("Debe seleccionar un ciclo");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ANIO", Value = xWhere.ANIO, DbType = System.Data.DbType.Int16 },
                new CParameter() { ParameterName = "NUMERO_PERIODO", Value = xWhere.NUMERO_PERIODO, DbType = System.Data.DbType.Byte },
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: respuestas del cuestionario de una solicitud.
        public async Task<CResult> GetRespuestasAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO_BECA <= 0)
                return Error("Debe indicar la solicitud de beca");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO_BECA", Value = xWhere.CORR_PROSPECTO_BECA, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetRespuestasAsync(p);
        }

        // Qué hace: archivos cargados de la solicitud, agrupables por sección del cuestionario.
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

        private static CResult Error(string mensaje)
        {
            return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = mensaje };
        }
    }
}
