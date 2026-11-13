using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
    public class ACA_PROSPECTO_BECA_ARCHIVOService : IACA_PROSPECTO_BECA_ARCHIVOService
    {
        private readonly string _raizDocumentos;
        private readonly IACA_PROSPECTO_BECA_ARCHIVORepository _repo;
        private readonly ILogger<ACA_PROSPECTO_BECA_ARCHIVOService> _logger;

        public ACA_PROSPECTO_BECA_ARCHIVOService(IACA_PROSPECTO_BECA_ARCHIVORepository repo,
            IConfiguration config, ILogger<ACA_PROSPECTO_BECA_ARCHIVOService> logger)
        {
            _repo = repo;
            _logger = logger;
            _raizDocumentos = Path.GetFullPath(config["Becas:RaizDocumentos"]
                ?? @"\\192.168.1.8\admision\Documentacion Becas");
        }

        public Task<CResult> GetArchivosAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_PROSPECTO_BECA <= 0)
                return Task.FromResult(Error("Debe indicar la empresa y la solicitud de beca"));

            return _repo.GetArchivosAsync(ParametrosArchivo(xWhere.CORR_EMPRESA, xWhere.CORR_PROSPECTO_BECA));
        }

        public async Task<AcaProspectoBecaArchivoAbierto> AbrirArchivoAsync(ACA_PROSPECTO_BECAParam xWhere)
        {
            if (xWhere.CORR_EMPRESA <= 0 || xWhere.CORR_PROSPECTO_BECA <= 0 || xWhere.CORR_RESPUESTA_BECA <= 0)
                return new AcaProspectoBecaArchivoAbierto();

            var resultado = await _repo.GetArchivoAsync(ParametrosArchivo(xWhere.CORR_EMPRESA,
                xWhere.CORR_PROSPECTO_BECA, xWhere.CORR_RESPUESTA_BECA));
            if (resultado?.Result != true)
                throw new InvalidOperationException("No se pudo consultar el documento: " + resultado?.ErrorMessage);

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

        public async Task<CResult> ReemplazarArchivoAsync(int corrEmpresa, string usuario,
            int corrProspectoBeca, int corrRespuestaBeca, IFormFile archivo)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(usuario))
                return Error("La sesión no es válida");
            if (corrProspectoBeca <= 0 || corrRespuestaBeca <= 0 || archivo == null || archivo.Length == 0)
                return Error("Seleccione un archivo");
            if (archivo.Length > 5 * 1024 * 1024)
                return Error("El archivo no puede superar 5 MB");

            var extension = Path.GetExtension(archivo.FileName ?? "").ToLowerInvariant();
            if (extension != ".pdf" && extension != ".jpg" && extension != ".jpeg" && extension != ".png" && extension != ".webp")
                return Error("Solo se permiten archivos PDF, JPG, PNG o WEBP");

            var contexto = await _repo.GetContextoArchivoAsync(ParametrosArchivo(corrEmpresa, corrProspectoBeca, corrRespuestaBeca));
            if (contexto?.Result != true)
            {
                _logger.LogError("No se pudo consultar el documento {Respuesta}: {Error}", corrRespuestaBeca, contexto?.ErrorMessage);
                return Error("No se pudo consultar el documento");
            }
            var row = (contexto.Data as List<ACA_PROSPECTO_BECA_ARCHIVO_EDICIONView>)?.FirstOrDefault();
            if (row == null || !string.Equals(row.TIPO_RESPUESTA, "DOCUMENTO", StringComparison.OrdinalIgnoreCase))
                return Error("No se encontró el documento de esta solicitud y empresa");

            var directorio = ResolverDirectorio(row.CARPETA);
            if (directorio == null)
                return Error("La carpeta del archivo no es válida");

            var nombre = row.CORR_PREGUNTA_BECA + "_" + Guid.NewGuid().ToString("N") + "_"
                + LimpiarNombre(Path.GetFileNameWithoutExtension(archivo.FileName)) + extension;
            var destino = Path.GetFullPath(Path.Combine(directorio, nombre));
            if (nombre.Length > 255 || destino.Length > 500 || !EstaDentro(destino, directorio))
                return Error("El nombre o la ruta del archivo no son válidos");

            string anterior;
            var creado = false;
            try
            {
                anterior = ResolverRuta(new ACA_PROSPECTO_BECA_ARCHIVOView
                {
                    CARPETA = row.CARPETA, ARCHIVO_NOMBRE = row.ARCHIVO_NOMBRE, ARCHIVO_RUTA = row.ARCHIVO_RUTA,
                });
                Directory.CreateDirectory(directorio);
                await using (var stream = new FileStream(destino, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    creado = true;
                    await archivo.CopyToAsync(stream);
                }

                var estacion = Environment.MachineName;
                var p = new List<CParameter>
                {
                    new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                    new() { ParameterName = "@SOLICITUD", Value = corrProspectoBeca, DbType = DbType.Int32 },
                    new() { ParameterName = "@RESPUESTA", Value = corrRespuestaBeca, DbType = DbType.Int32 },
                    new() { ParameterName = "@NOMBRE", Value = nombre, DbType = DbType.AnsiString, Size = 255 },
                    new() { ParameterName = "@RUTA", Value = destino, DbType = DbType.AnsiString, Size = 500 },
                    new() { ParameterName = "@RUTA_ANTERIOR", Value = (object)row.ARCHIVO_RUTA ?? DBNull.Value, DbType = DbType.AnsiString, Size = 500 },
                    new() { ParameterName = "@USUARIO", Value = usuario.Substring(0, Math.Min(usuario.Length, 30)), DbType = DbType.AnsiString, Size = 30 },
                    new() { ParameterName = "@ESTACION", Value = estacion.Substring(0, Math.Min(estacion.Length, 30)), DbType = DbType.AnsiString, Size = 30 },
                };
                var resultado = await _repo.GuardarArchivoAsync(p);
                if (resultado?.Result != true)
                {
                    EliminarArchivo(destino);
                    _logger.LogWarning("No se pudo actualizar el documento {Respuesta}: {Error}", corrRespuestaBeca, resultado?.ErrorMessage);
                    return Error(resultado?.ErrorCode >= 51000 && resultado.ErrorCode < 51100
                        ? resultado.ErrorMessage : "No se pudo actualizar el documento");
                }
            }
            catch (Exception ex)
            {
                if (creado) EliminarArchivo(destino);
                _logger.LogError(ex, "Error al reemplazar el documento {Respuesta} de la solicitud {Solicitud}", corrRespuestaBeca, corrProspectoBeca);
                return Error("No se pudo guardar el documento. Verifique el acceso al almacenamiento");
            }

            if (anterior != null && !string.Equals(anterior, destino, StringComparison.OrdinalIgnoreCase))
                EliminarArchivo(anterior);

            return new CResult { Result = true, Data = nombre, RowsAffected = 1, ErrorMessage = "Archivo actualizado" };
        }

        private string ResolverRuta(ACA_PROSPECTO_BECA_ARCHIVOView row)
        {
            if (row == null) return null;
            var nombre = Path.GetFileName(row.ARCHIVO_NOMBRE ?? "");
            if (string.IsNullOrWhiteSpace(nombre)) return null;

            if (!string.IsNullOrWhiteSpace(row.ARCHIVO_RUTA))
            {
                var registrada = Path.GetFullPath(row.ARCHIVO_RUTA);
                if (string.Equals(Path.GetFileName(registrada), nombre, StringComparison.OrdinalIgnoreCase)
                    && EstaDentro(registrada, _raizDocumentos) && ExisteArchivo(registrada))
                    return registrada;
            }

            var ruta = RutaDeCarpeta(row.CARPETA, nombre);
            if (ExisteArchivo(ruta)) return ruta;

            // Compatibilidad con documentos anteriores guardados por número de solicitud.
            if (row.NUMERO_PERIODO.HasValue)
            {
                var anterior = RutaDeCarpeta(row.ANIO + "-" + row.NUMERO_PERIODO + "_" + row.CORR_PROSPECTO_BECA, nombre);
                if (!string.Equals(anterior, ruta, StringComparison.OrdinalIgnoreCase) && ExisteArchivo(anterior))
                    return anterior;
            }
            return null;
        }

        private string ResolverDirectorio(string carpeta)
        {
            if (string.IsNullOrWhiteSpace(carpeta) || Path.IsPathRooted(carpeta)) return null;
            var directorio = Path.GetFullPath(Path.Combine(_raizDocumentos, carpeta));
            return EstaDentro(directorio, _raizDocumentos) ? directorio : null;
        }

        private string RutaDeCarpeta(string carpeta, string nombre)
        {
            var directorio = ResolverDirectorio(carpeta);
            if (directorio == null) return null;
            var ruta = Path.GetFullPath(Path.Combine(directorio, nombre));
            return EstaDentro(ruta, directorio) ? ruta : null;
        }

        private static bool ExisteArchivo(string ruta)
        {
            if (ruta == null) return false;
            try { return (File.GetAttributes(ruta) & FileAttributes.Directory) == 0; }
            catch (FileNotFoundException) { return false; }
            catch (DirectoryNotFoundException) { return false; }
        }

        private void EliminarArchivo(string ruta)
        {
            try { File.Delete(ruta); }
            catch (IOException ex) { _logger.LogWarning(ex, "No se pudo retirar un archivo de becas"); }
            catch (UnauthorizedAccessException ex) { _logger.LogWarning(ex, "No se pudo retirar un archivo de becas"); }
        }

        private static List<CParameter> ParametrosArchivo(int empresa, int solicitud, int? respuesta = null)
        {
            var p = new List<CParameter>
            {
                new() { ParameterName = "CORR_EMPRESA", Value = empresa, DbType = DbType.Int32 },
                new() { ParameterName = "CORR_PROSPECTO_BECA", Value = solicitud, DbType = DbType.Int32 },
            };
            if (respuesta.HasValue)
                p.Add(new CParameter { ParameterName = "CORR_RESPUESTA_BECA", Value = respuesta.Value, DbType = DbType.Int32 });
            return p;
        }

        private static bool EstaDentro(string ruta, string carpeta)
            => ruta.StartsWith(carpeta.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase);

        private static string ContentType(string nombre)
        {
            switch (Path.GetExtension(nombre ?? "").ToLowerInvariant())
            {
                case ".pdf": return "application/pdf";
                case ".jpg": case ".jpeg": return "image/jpeg";
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
            if (string.IsNullOrWhiteSpace(limpio)) limpio = "archivo";
            return limpio.Length > 80 ? limpio.Substring(0, 80) : limpio;
        }

        private static CResult Error(string mensaje)
            => new CResult { Result = false, ErrorCode = -1, ErrorMessage = mensaje };
    }
}
