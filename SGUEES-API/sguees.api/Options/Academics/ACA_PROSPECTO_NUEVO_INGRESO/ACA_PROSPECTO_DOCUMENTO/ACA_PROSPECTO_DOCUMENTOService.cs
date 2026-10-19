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
    public class ACA_PROSPECTO_DOCUMENTOService : IACA_PROSPECTO_DOCUMENTOService
    {
        // Qué hace: misma carpeta que el portal de admisión.
        // Cómo lo hace: Documentacion Admision\{ciclo}_{CIF}, hermana de Documentacion Becas.
        private const string RaizDocumentos = @"\\192.168.1.8\admision\Documentacion Admision";

        private static readonly Dictionary<string, string[]> ExtensionesPorFormato = new(StringComparer.OrdinalIgnoreCase)
        {
            ["PDF"] = new[] { ".pdf" },
            ["JPG"] = new[] { ".jpg", ".jpeg" },
            ["PNG"] = new[] { ".png" },
        };

        private readonly IACA_PROSPECTO_DOCUMENTORepository _repo;
        private readonly string _connectionString;

        public ACA_PROSPECTO_DOCUMENTOService(IACA_PROSPECTO_DOCUMENTORepository repo, IConfiguration config)
        {
            _repo = repo;
            _connectionString = config.GetConnectionString("defaultConnection");
        }

        // Qué hace: documentos que aplican a esta solicitud de nuevo ingreso.
        // Cómo lo hace: exige CORR_PROSPECTO porque eFramework omite del WHERE los enteros en 0.
        public async Task<CResult> GetAllAsync(ACA_PROSPECTO_DOCUMENTOParam xWhere)
        {
            if (xWhere.CORR_PROSPECTO <= 0)
                return Error("Debe indicar el prospecto");

            var p = new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO", Value = xWhere.CORR_PROSPECTO, DbType = System.Data.DbType.Int32 },
            };

            return await _repo.GetAllAsync(p);
        }

        // Qué hace: entrega el archivo cargado de esa solicitud para previsualizarlo.
        // Cómo lo hace: usa la ruta guardada en la base y solo si sigue dentro de la carpeta de admisión.
        public async Task<ACA_PROSPECTO_DOCUMENTOArchivo> AbrirArchivoAsync(int corrEmpresa, int corrProspecto, int corrDocumentoAdmision)
        {
            if (corrProspecto <= 0 || corrDocumentoAdmision <= 0)
                return null;

            string ruta;
            string nombre;
            await using (var cn = new SqlConnection(_connectionString))
            {
                await cn.OpenAsync();
                await using var cmd = cn.CreateCommand();
                cmd.CommandText = @"
                    SELECT C.RUTA_ARCHIVO, C.NOMBRE_ARCHIVO
                    FROM dbo.ACA_PROSPECTO_DOCUMENTO C
                    INNER JOIN dbo.ACA_PROSPECTO P ON P.CORR_PROSPECTO = C.CORR_PROSPECTO
                    WHERE P.CORR_EMPRESA = @Empresa
                      AND C.CORR_PROSPECTO = @Prospecto
                      AND C.CORR_DOCUMENTO_ADMISION = @Documento
                      AND C.ACTIVO = 1;";
                cmd.Parameters.Add(new SqlParameter("@Empresa", corrEmpresa));
                cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                cmd.Parameters.Add(new SqlParameter("@Documento", corrDocumentoAdmision));
                await using var rd = await cmd.ExecuteReaderAsync();
                if (!await rd.ReadAsync() || rd.IsDBNull(0))
                    return null;
                ruta = rd.GetString(0);
                nombre = rd.IsDBNull(1) ? "documento" : rd.GetString(1);
            }

            var raiz = Path.GetFullPath(RaizDocumentos);
            var destino = Path.GetFullPath(Path.Combine(raiz, ruta));
            if (!EstaDentro(destino, raiz) || !File.Exists(destino))
                return null;

            var extension = Path.GetExtension(destino).ToLowerInvariant();
            var tipo = extension switch
            {
                ".pdf" => "application/pdf",
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream",
            };
            return new ACA_PROSPECTO_DOCUMENTOArchivo
            {
                Stream = new FileStream(destino, FileMode.Open, FileAccess.Read, FileShare.Read),
                ContentType = tipo,
                Nombre = nombre,
            };
        }

        // Qué hace: quita el archivo cargado y deja el documento pendiente otra vez.
        // Cómo lo hace: apaga la fila del archivo, borra el archivo de la carpeta y devuelve la fila de la vista.
        public async Task<CResult> QuitarArchivoAsync(int corrEmpresa, string usuario, string estacion, int corrProspecto, int corrDocumentoAdmision)
        {
            if (corrProspecto <= 0 || corrDocumentoAdmision <= 0)
                return Error("Debe indicar el prospecto y el documento");

            int? corrDocumento = null;
            string ruta = null;
            await using (var cn = new SqlConnection(_connectionString))
            {
                await cn.OpenAsync();
                await using (var cmd = cn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT C.CORR_PROSPECTO_DOCUMENTO, C.RUTA_ARCHIVO
                        FROM dbo.ACA_PROSPECTO_DOCUMENTO C
                        INNER JOIN dbo.ACA_PROSPECTO P ON P.CORR_PROSPECTO = C.CORR_PROSPECTO
                        WHERE P.CORR_EMPRESA = @Empresa
                          AND C.CORR_PROSPECTO = @Prospecto
                          AND C.CORR_DOCUMENTO_ADMISION = @Documento
                          AND C.ACTIVO = 1;";
                    cmd.Parameters.Add(new SqlParameter("@Empresa", corrEmpresa));
                    cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                    cmd.Parameters.Add(new SqlParameter("@Documento", corrDocumentoAdmision));
                    await using var rd = await cmd.ExecuteReaderAsync();
                    if (!await rd.ReadAsync())
                        return Error("Este documento no tiene un archivo cargado.");
                    corrDocumento = rd.GetInt32(0);
                    ruta = rd.IsDBNull(1) ? null : rd.GetString(1);
                }

                await using (var cmd = cn.CreateCommand())
                {
                    cmd.CommandText = @"
                        UPDATE dbo.ACA_PROSPECTO_DOCUMENTO
                        SET ACTIVO = 0,
                            USUARIO_ACTU = @Usuario,
                            ESTACION_ACTU = @Estacion,
                            FECHA_ACTU = GETDATE()
                        WHERE CORR_PROSPECTO_DOCUMENTO = @Id
                          AND CORR_PROSPECTO = @Prospecto
                          AND ACTIVO = 1;";
                    cmd.Parameters.Add(new SqlParameter("@Id", corrDocumento.Value));
                    cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                    cmd.Parameters.Add(new SqlParameter("@Usuario", usuario ?? ""));
                    cmd.Parameters.Add(new SqlParameter("@Estacion", estacion ?? ""));
                    if (await cmd.ExecuteNonQueryAsync() != 1)
                        return Error("No se pudo quitar el archivo.");
                }
            }

            if (!string.IsNullOrWhiteSpace(ruta))
            {
                var raiz = Path.GetFullPath(RaizDocumentos);
                var destino = Path.GetFullPath(Path.Combine(raiz, ruta));
                if (EstaDentro(destino, raiz))
                    TryDelete(destino);
            }

            var lectura = await _repo.GetAllAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO", Value = corrProspecto, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = corrDocumentoAdmision, DbType = System.Data.DbType.Int32 },
            });
            var fila = (lectura.Data as List<ACA_PROSPECTO_DOCUMENTOView>)?.FirstOrDefault();
            return new CResult()
            {
                Data = fila,
                Result = fila != null,
                ErrorCode = fila != null ? 0 : -1,
                ErrorMessage = fila != null ? "Archivo eliminado" : "No se pudo leer el documento.",
                RowsAffected = fila != null ? 1 : 0,
            };
        }

        // Qué hace: guarda o reemplaza el archivo de un documento que ya aplica a la solicitud.
        // Cómo lo hace: valida formato, tamaño y contenido como el portal, escribe el archivo
        //               y actualiza ACA_PROSPECTO_DOCUMENTO. Devuelve la fila de la vista.
        public async Task<CResult> CargarArchivoAsync(int corrEmpresa, string usuario, string estacion, int corrProspecto, int corrDocumentoAdmision, IFormFile archivo)
        {
            if (corrProspecto <= 0 || corrDocumentoAdmision <= 0)
                return Error("Debe indicar el prospecto y el documento");
            if (archivo == null || archivo.Length == 0)
                return Error("Seleccione un archivo para cargar.");

            await using var cn = new SqlConnection(_connectionString);
            await cn.OpenAsync();

            string codigo;
            string formatos;
            int maximoMb;
            string cif;
            int corrPeriodo;
            string ciclo;
            int? corrDocumento;
            string rutaAnterior;

            await using (var cmd = cn.CreateCommand())
            {
                cmd.CommandText = @"
                    SELECT V.CODIGO, V.FORMATOS_PERMITIDOS, V.TAMANO_MAXIMO_MB,
                           P.CODIGO_PROSPECTO, P.CORR_PERIODO_ACADEMICO,
                           CAST(PA.ANIO AS varchar(4)) + '-' + CAST(PA.NUMERO_PERIODO AS varchar(20)),
                           V.CORR_PROSPECTO_DOCUMENTO, C.RUTA_ARCHIVO
                    FROM dbo.V_ACA_PROSPECTO_DOCUMENTO_NUEVO_INGRESO V
                    INNER JOIN dbo.ACA_PROSPECTO P ON P.CORR_PROSPECTO = V.CORR_PROSPECTO
                    INNER JOIN dbo.ACA_PERIODOS_ACADEMICOS PA ON PA.CORR_PERIODO_ACADEMICO = P.CORR_PERIODO_ACADEMICO
                    LEFT JOIN dbo.ACA_PROSPECTO_DOCUMENTO C ON C.CORR_PROSPECTO_DOCUMENTO = V.CORR_PROSPECTO_DOCUMENTO
                    WHERE V.CORR_EMPRESA = @Empresa
                      AND V.CORR_PROSPECTO = @Prospecto
                      AND V.CORR_DOCUMENTO_ADMISION = @Documento;";
                cmd.Parameters.Add(new SqlParameter("@Empresa", corrEmpresa));
                cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                cmd.Parameters.Add(new SqlParameter("@Documento", corrDocumentoAdmision));
                await using var rd = await cmd.ExecuteReaderAsync();
                if (!await rd.ReadAsync())
                    return Error("Este documento no aplica a esta solicitud.");

                codigo = rd.IsDBNull(0) ? "DOC" : rd.GetString(0);
                formatos = rd.IsDBNull(1) ? "PDF,JPG,PNG" : rd.GetString(1);
                maximoMb = rd.IsDBNull(2) ? 10 : Convert.ToInt32(rd.GetValue(2));
                if (maximoMb <= 0)
                    maximoMb = 10;
                cif = rd.IsDBNull(3) ? "" : rd.GetString(3);
                corrPeriodo = rd.GetInt32(4);
                ciclo = rd.IsDBNull(5) ? "" : rd.GetString(5);
                corrDocumento = rd.IsDBNull(6) ? null : rd.GetInt32(6);
                rutaAnterior = rd.IsDBNull(7) ? null : rd.GetString(7);
            }

            if (string.IsNullOrWhiteSpace(ciclo) || string.IsNullOrWhiteSpace(cif))
                return Error("El prospecto no tiene periodo o CIF para guardar el documento.");

            var errorArchivo = await ValidarArchivoAsync(archivo, formatos, maximoMb);
            if (errorArchivo != null)
                return Error(errorArchivo);

            var extension = Path.GetExtension(archivo.FileName ?? "").ToLowerInvariant();
            var nombreOriginal = LimpiarNombre(Path.GetFileNameWithoutExtension(archivo.FileName));
            if (nombreOriginal.Length > 120)
                nombreOriginal = nombreOriginal.Substring(0, 120);

            var nombreArchivo = LimpiarNombre(codigo) + "_" + nombreOriginal + "_" + DateTime.Now.ToString("yyyyMMddHHmmss") + extension;
            if (nombreArchivo.Length > 255)
                return Error("El nombre del archivo es demasiado largo");

            var carpeta = LimpiarNombre(ciclo + "_" + cif);
            var raiz = Path.GetFullPath(RaizDocumentos);
            var directorio = Path.GetFullPath(Path.Combine(raiz, carpeta));
            if (!EstaDentro(directorio, raiz))
                return Error("La carpeta del archivo no es válida");

            var destino = Path.GetFullPath(Path.Combine(directorio, nombreArchivo));
            if (!EstaDentro(destino, directorio))
                return Error("El nombre del archivo no es válido");

            var rutaRelativa = Path.Combine(carpeta, nombreArchivo);
            if (rutaRelativa.Length > 500)
                return Error("La ruta del archivo es demasiado larga");

            try
            {
                Directory.CreateDirectory(directorio);
                await using var stream = new FileStream(destino, FileMode.CreateNew, FileAccess.Write, FileShare.None);
                await archivo.CopyToAsync(stream);
            }
            catch (UnauthorizedAccessException)
            {
                return Error("No hay permisos para guardar en la carpeta de documentos.");
            }
            catch (IOException ex)
            {
                return Error("No se pudo guardar el archivo. " + ex.Message);
            }

            try
            {
                await using var tx = (SqlTransaction)await cn.BeginTransactionAsync();
                await using var cmd = cn.CreateCommand();
                cmd.Transaction = tx;
                if (corrDocumento.HasValue)
                {
                    cmd.CommandText = @"
                        UPDATE dbo.ACA_PROSPECTO_DOCUMENTO
                        SET CORR_PERIODO_ACADEMICO = @Periodo,
                            NOMBRE_ARCHIVO = @Nombre,
                            RUTA_ARCHIVO = @Ruta,
                            FECHA_CARGA = GETDATE(),
                            ESTADO_REVISION = 'PENDIENTE',
                            OBSERVACION = NULL,
                            USUARIO_REVISION = NULL,
                            FECHA_REVISION = NULL,
                            USUARIO_ACTU = @Usuario,
                            ESTACION_ACTU = @Estacion,
                            FECHA_ACTU = GETDATE()
                        WHERE CORR_PROSPECTO_DOCUMENTO = @Id
                          AND CORR_PROSPECTO = @Prospecto
                          AND ACTIVO = 1;";
                    cmd.Parameters.Add(new SqlParameter("@Id", corrDocumento.Value));
                }
                else
                {
                    cmd.CommandText = @"
                        INSERT INTO dbo.ACA_PROSPECTO_DOCUMENTO (
                            CORR_PROSPECTO, CORR_DOCUMENTO_ADMISION, CORR_PERIODO_ACADEMICO,
                            NOMBRE_ARCHIVO, RUTA_ARCHIVO, FECHA_CARGA, ESTADO_REVISION, ACTIVO,
                            USUARIO_CREA, ESTACION_CREA, FECHA_CREA)
                        VALUES (
                            @Prospecto, @Documento, @Periodo,
                            @Nombre, @Ruta, GETDATE(), 'PENDIENTE', 1,
                            @Usuario, @Estacion, GETDATE());";
                    cmd.Parameters.Add(new SqlParameter("@Documento", corrDocumentoAdmision));
                }

                cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                cmd.Parameters.Add(new SqlParameter("@Periodo", corrPeriodo));
                cmd.Parameters.Add(new SqlParameter("@Nombre", nombreArchivo));
                cmd.Parameters.Add(new SqlParameter("@Ruta", rutaRelativa));
                cmd.Parameters.Add(new SqlParameter("@Usuario", usuario));
                cmd.Parameters.Add(new SqlParameter("@Estacion", estacion));
                var filas = await cmd.ExecuteNonQueryAsync();
                if (filas != 1)
                    throw new InvalidOperationException("No se actualizó el documento.");
                await tx.CommitAsync();
            }
            catch (Exception ex)
            {
                TryDelete(destino);
                return Error("No se pudo registrar el documento. " + ex.Message);
            }

            if (!string.IsNullOrWhiteSpace(rutaAnterior) && !string.Equals(rutaAnterior, rutaRelativa, StringComparison.OrdinalIgnoreCase))
            {
                var anterior = Path.GetFullPath(Path.Combine(raiz, rutaAnterior));
                if (EstaDentro(anterior, raiz))
                    TryDelete(anterior);
            }

            var lectura = await _repo.GetAllAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_PROSPECTO", Value = corrProspecto, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = corrDocumentoAdmision, DbType = System.Data.DbType.Int32 },
            });
            var fila = (lectura.Data as List<ACA_PROSPECTO_DOCUMENTOView>)?.FirstOrDefault();
            return new CResult()
            {
                Data = fila,
                Result = true,
                ErrorCode = 0,
                ErrorMessage = "Documento cargado",
                RowsAffected = 1,
            };
        }

        private static async Task<string> ValidarArchivoAsync(IFormFile archivo, string formatosTexto, int maximoMb)
        {
            var formatos = (string.IsNullOrWhiteSpace(formatosTexto) ? "PDF,JPG,PNG" : formatosTexto)
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(f => f.ToUpperInvariant())
                .Where(f => ExtensionesPorFormato.ContainsKey(f))
                .Distinct()
                .ToList();
            if (formatos.Count == 0)
                formatos = new List<string> { "PDF", "JPG", "PNG" };

            var extension = Path.GetExtension(archivo.FileName ?? "").ToLowerInvariant();
            var formato = formatos.FirstOrDefault(f => ExtensionesPorFormato[f].Contains(extension));
            if (formato == null)
                return "Este documento solo acepta " + Describir(formatos) + ".";

            if (archivo.Length > maximoMb * 1024L * 1024L)
                return "El archivo supera el máximo de " + maximoMb + " MB.";

            if (!await ContenidoCoincideAsync(archivo, formato))
                return "El archivo no es un " + formato + " válido: puede estar dañado o tener la extensión cambiada.";

            return null;
        }

        private static async Task<bool> ContenidoCoincideAsync(IFormFile archivo, string formato)
        {
            var cabecera = new byte[1024];
            var leidos = 0;
            await using (var stream = archivo.OpenReadStream())
            {
                int n;
                while (leidos < cabecera.Length && (n = await stream.ReadAsync(cabecera, leidos, cabecera.Length - leidos)) > 0)
                    leidos += n;
            }

            switch (formato)
            {
                case "PDF":
                    for (var i = 0; i + 4 < leidos; i++)
                        if (cabecera[i] == 0x25 && cabecera[i + 1] == 0x50 && cabecera[i + 2] == 0x44 && cabecera[i + 3] == 0x46 && cabecera[i + 4] == 0x2D)
                            return true;
                    return false;
                case "JPG":
                    return leidos >= 3 && cabecera[0] == 0xFF && cabecera[1] == 0xD8 && cabecera[2] == 0xFF;
                case "PNG":
                    return leidos >= 8 && cabecera[0] == 0x89 && cabecera[1] == 0x50 && cabecera[2] == 0x4E && cabecera[3] == 0x47
                        && cabecera[4] == 0x0D && cabecera[5] == 0x0A && cabecera[6] == 0x1A && cabecera[7] == 0x0A;
                default:
                    return true;
            }
        }

        private static string Describir(List<string> formatos)
        {
            return formatos.Count == 1
                ? formatos[0]
                : string.Join(", ", formatos.Take(formatos.Count - 1)) + " o " + formatos.Last();
        }

        private static string LimpiarNombre(string nombre)
        {
            var invalidos = Path.GetInvalidFileNameChars();
            var limpio = new string((nombre ?? "documento").Select(c => invalidos.Contains(c) ? '_' : c).ToArray()).Trim();
            return string.IsNullOrWhiteSpace(limpio) ? "documento" : limpio;
        }

        private static bool EstaDentro(string ruta, string raiz)
        {
            var baseFull = Path.GetFullPath(raiz).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
            var full = Path.GetFullPath(ruta);
            return full.StartsWith(baseFull, StringComparison.OrdinalIgnoreCase) || string.Equals(full, Path.GetFullPath(raiz), StringComparison.OrdinalIgnoreCase);
        }

        private static void TryDelete(string ruta)
        {
            try
            {
                if (File.Exists(ruta))
                    File.Delete(ruta);
            }
            catch
            {
            }
        }

        private static CResult Error(string mensaje)
        {
            return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = mensaje };
        }
    }
}
