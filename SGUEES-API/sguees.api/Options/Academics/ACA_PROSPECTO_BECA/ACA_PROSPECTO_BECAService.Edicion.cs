using System.Data;
using System.Xml.Linq;
using System.Globalization;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using sguees.Models;

namespace sguees.Services
{
    public partial class ACA_PROSPECTO_BECAService
    {
        private static CParameter Parameter(string name, DbType type, object value)
            => new() { ParameterName = name, DbType = type, Value = value ?? DBNull.Value };

        public Task<CResult> GetOpcionesAsync(int corrEmpresa, int corrPreguntaBeca)
        {
            if (corrEmpresa <= 0 || corrPreguntaBeca <= 0) return Task.FromResult(Error("Seleccione la empresa y la pregunta."));
            return _repo.GetOpcionesAsync(new List<CParameter>{
                Parameter("CORR_EMPRESA",DbType.Int32,corrEmpresa),
                Parameter("CORR_PREGUNTA_BECA",DbType.Int32,corrPreguntaBeca)
            });
        }

        public Task<CResult> GuardarRespuestaAsync(int corrEmpresa, string usuario, AcaProspectoBecaRespuestaEdicion edicion)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(usuario) || usuario.Length > 30) return Task.FromResult(Error("No se encontró una sesión válida."));
            if (edicion == null || edicion.CORR_PROSPECTO_BECA <= 0 || edicion.CORR_PREGUNTA_BECA <= 0 || edicion.Filas == null || edicion.Filas.Count == 0 || edicion.Filas.Count > 1000)
                return Task.FromResult(Error("La respuesta no está completa o excede el límite de filas."));
            if (edicion.Filas.Any(f => f == null || f.CORR_RESPUESTA_BECA <= 0) || edicion.Filas.Select(f => f.CORR_RESPUESTA_BECA).Distinct().Count() != edicion.Filas.Count)
                return Task.FromResult(Error("Hay filas inválidas o repetidas en la respuesta."));
            return _repo.GuardarRespuestaAsync(new List<CParameter>{
                Parameter("@CORR_EMPRESA",DbType.Int32,corrEmpresa),
                Parameter("@SOLICITUD",DbType.Int32,edicion.CORR_PROSPECTO_BECA),
                Parameter("@PREGUNTA",DbType.Int32,edicion.CORR_PREGUNTA_BECA),
                Parameter("@FILAS",DbType.Xml,new XElement("Filas",edicion.Filas.Select(f=>new XElement("Fila",
                    new XElement("CORR_RESPUESTA_BECA",f.CORR_RESPUESTA_BECA),new XElement("CORR_OPCION_BECA",f.CORR_OPCION_BECA),
                    new XElement("RESPUESTA_TEXTO",f.RESPUESTA_TEXTO),new XElement("RESPUESTA_NUMERO",f.RESPUESTA_NUMERO?.ToString(CultureInfo.InvariantCulture))))).ToString(SaveOptions.DisableFormatting)),
                Parameter("@USUARIO",DbType.AnsiString,usuario),
                Parameter("@ESTACION",DbType.AnsiString,Environment.MachineName[..Math.Min(30,Environment.MachineName.Length)])
            });
        }

        public async Task<CResult> ReemplazarArchivoAsync(int corrEmpresa, string usuario, int corrProspectoBeca, int corrRespuestaBeca, IFormFile archivo)
        {
            if (corrEmpresa <= 0 || string.IsNullOrWhiteSpace(usuario) || usuario.Length > 30) return Error("No se encontró una sesión válida.");
            if (corrProspectoBeca <= 0 || corrRespuestaBeca <= 0 || archivo == null || archivo.Length == 0) return Error("Seleccione un archivo.");
            if (archivo.Length > 5 * 1024 * 1024) return Error("El archivo no puede superar 5 MB.");
            var extension = Path.GetExtension(archivo.FileName ?? "").ToLowerInvariant();
            if (!new[] { ".pdf", ".jpg", ".jpeg", ".png", ".webp" }.Contains(extension)) return Error("Solo se permiten archivos PDF, JPG, PNG o WEBP.");
            var context = await _repo.GetContextoArchivoAsync(new List<CParameter>{
                Parameter("CORR_EMPRESA",DbType.Int32,corrEmpresa),
                Parameter("CORR_PROSPECTO_BECA",DbType.Int32,corrProspectoBeca),
                Parameter("CORR_RESPUESTA_BECA",DbType.Int32,corrRespuestaBeca)
            });
            if (!context.Result) return context;
            var row = (context.Data as IEnumerable<ACA_PROSPECTO_BECA_ARCHIVO_EDICIONView>)?.SingleOrDefault();
            if (row == null) return Error("El documento no existe en su empresa o la solicitud ya no permite modificaciones.");
            var raiz = Path.GetFullPath(RaizDocumentos);
            var directorio = Path.GetFullPath(Path.Combine(raiz, row.CARPETA));
            if (!EstaDentro(directorio, raiz)) return Error("La carpeta del archivo no es válida.");
            var nombre = $"{row.CORR_PREGUNTA_BECA}_{Guid.NewGuid():N}_{LimpiarNombre(Path.GetFileNameWithoutExtension(archivo.FileName))}{extension}";
            var destino = Path.GetFullPath(Path.Combine(directorio, nombre));
            if (!EstaDentro(destino, directorio) || nombre.Length > 255 || destino.Length > 500) return Error("El nombre o la ruta del archivo no es válido.");
            var creado = false;
            try
            {
                Directory.CreateDirectory(directorio);
                await using (var stream = new FileStream(destino, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    creado = true;
                    await archivo.CopyToAsync(stream);
                }
                var saved = await _repo.GuardarArchivoAsync(new List<CParameter>{
                    Parameter("@CORR_EMPRESA",DbType.Int32,corrEmpresa),Parameter("@SOLICITUD",DbType.Int32,corrProspectoBeca),
                    Parameter("@RESPUESTA",DbType.Int32,corrRespuestaBeca),Parameter("@NOMBRE",DbType.AnsiString,nombre),
                    Parameter("@RUTA",DbType.AnsiString,destino),Parameter("@RUTA_ANTERIOR",DbType.AnsiString,row.ARCHIVO_RUTA),
                    Parameter("@USUARIO",DbType.AnsiString,usuario),Parameter("@ESTACION",DbType.AnsiString,Environment.MachineName[..Math.Min(30,Environment.MachineName.Length)])
                });
                if (!saved.Result)
                {
                    File.Delete(destino);
                    return saved;
                }
                // Conservar los anteriores evita sobrescribir o eliminar un documento compartido.
                return new CResult { Result = true, Data = nombre, RowsAffected = 1, ErrorMessage = "Archivo actualizado" };
            }
            catch (IOException ex)
            {
                if (creado && File.Exists(destino)) File.Delete(destino);
                return Error("No se pudo guardar el archivo: " + ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                if (creado && File.Exists(destino)) File.Delete(destino);
                return Error("La cuenta que ejecuta la API no tiene acceso a la carpeta de documentos.");
            }
        }

        private static string LimpiarNombre(string nombre)
        {
            var limpio = new string((nombre ?? "archivo").Where(c => char.IsLetterOrDigit(c) || c == ' ' || c == '-' || c == '_').ToArray()).Trim();
            if (string.IsNullOrWhiteSpace(limpio)) limpio = "archivo";
            return limpio[..Math.Min(80, limpio.Length)];
        }
    }
}
