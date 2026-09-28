using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using sguees.Models;

namespace sguees.Services
{
    public class AcaProspectoBecaRespuestaEdicion
    {
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_PREGUNTA_BECA { get; set; }
        public List<AcaProspectoBecaRespuestaFilaEdicion> Filas { get; set; } = new();
    }

    public class AcaProspectoBecaRespuestaFilaEdicion
    {
        public int CORR_RESPUESTA_BECA { get; set; }
        public int CORR_OPCION_BECA { get; set; }
        public string RESPUESTA_TEXTO { get; set; }
        public decimal? RESPUESTA_NUMERO { get; set; }
    }

    public partial class ACA_PROSPECTO_BECAService
    {
        // Qué hace: opciones activas de una pregunta, para cambiar la respuesta marcada.
        public async Task<CResult> GetOpcionesAsync(int corrEmpresa, int corrPreguntaBeca)
        {
            if (corrPreguntaBeca <= 0)
                return Error("Debe indicar la pregunta");

            var opciones = new List<object>();
            await using var cn = new SqlConnection(_connectionString);
            await cn.OpenAsync();
            await using var cmd = cn.CreateCommand();
            cmd.CommandText = @"
                SELECT O.CORR_OPCION_BECA, O.TEXTO_OPCION, O.ORDEN, ISNULL(PU.PUNTAJE, 0) AS PUNTAJE
                FROM dbo.ACA_PROSPECTO_BECA_OPCION O
                OUTER APPLY (
                    SELECT TOP (1) PUNTAJE
                    FROM dbo.ACA_PROSPECTO_BECA_PUNTAJE
                    WHERE ACTIVO = 1
                      AND CORR_OPCION_BECA = O.CORR_OPCION_BECA
                      AND (FECHA_FIN IS NULL OR FECHA_FIN >= CAST(GETDATE() AS date))
                    ORDER BY FECHA_INICIO DESC, CORR_PUNTAJE_BECA DESC
                ) PU
                WHERE O.CORR_PREGUNTA_BECA = @Pregunta
                  AND O.ACTIVO = 1
                  AND O.CORR_EMPRESA = @Empresa
                ORDER BY O.ORDEN;";
            cmd.Parameters.Add(new SqlParameter("@Pregunta", corrPreguntaBeca));
            cmd.Parameters.Add(new SqlParameter("@Empresa", corrEmpresa));
            await using var rd = await cmd.ExecuteReaderAsync();
            while (await rd.ReadAsync())
            {
                opciones.Add(new
                {
                    CORR_OPCION_BECA = rd.GetInt32(0),
                    TEXTO_OPCION = rd.GetString(1),
                    ORDEN = rd.GetInt32(2),
                    PUNTAJE = rd.GetDecimal(3),
                });
            }

            return new CResult { Result = true, Data = opciones, RowsAffected = opciones.Count };
        }

        // Qué hace: guarda el cambio de una pregunta y recalcula el puntaje de la solicitud.
        // Cómo lo hace: actualiza las filas de esa pregunta y aplica las mismas bandas
        //               de promedio y dependientes que usa el formulario de admisión.
        public async Task<CResult> GuardarRespuestaAsync(int corrEmpresa, string usuario, AcaProspectoBecaRespuestaEdicion edicion)
        {
            if (edicion == null || edicion.CORR_PROSPECTO_BECA <= 0 || edicion.CORR_PREGUNTA_BECA <= 0 || edicion.Filas == null || edicion.Filas.Count == 0)
                return Error("La respuesta no está completa");

            await using var cn = new SqlConnection(_connectionString);
            await cn.OpenAsync();
            await using var tx = (SqlTransaction)await cn.BeginTransactionAsync();
            try
            {
                var pregunta = await LeerPreguntaAsync(cn, tx, corrEmpresa, edicion.CORR_PROSPECTO_BECA, edicion.CORR_PREGUNTA_BECA);
                if (pregunta == null)
                    return Error("La pregunta no pertenece a esta solicitud");

                foreach (var fila in edicion.Filas)
                    await ActualizarFilaAsync(cn, tx, corrEmpresa, usuario, edicion, pregunta, fila);

                await AplicarBandasAsync(cn, tx, edicion.CORR_PROSPECTO_BECA);
                await RecalcularTotalesAsync(cn, tx, edicion.CORR_PROSPECTO_BECA);
                var totales = await LeerTotalesAsync(cn, tx, edicion.CORR_PROSPECTO_BECA);
                await tx.CommitAsync();
                return new CResult { Result = true, Data = totales, ErrorMessage = "Respuesta actualizada" };
            }
            catch (InvalidOperationException ex)
            {
                await tx.RollbackAsync();
                return Error(ex.Message);
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
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

        private async Task<PreguntaEdicion> LeerPreguntaAsync(SqlConnection cn, SqlTransaction tx, int empresa, int solicitud, int pregunta)
        {
            await using var cmd = cn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                SELECT P.TIPO_RESPUESTA, P.CODIGO_PREGUNTA
                FROM dbo.ACA_PROSPECTO_BECA_PREGUNTA P
                INNER JOIN dbo.ACA_PROSPECTO_BECA PB ON PB.CORR_PROSPECTO_BECA = @Solicitud
                WHERE P.CORR_PREGUNTA_BECA = @Pregunta
                  AND PB.CORR_EMPRESA = @Empresa
                  AND PB.ESTADO_BECA IN ('BORRADOR', 'ENVIADA')
                  AND EXISTS (
                      SELECT 1 FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                      WHERE R.CORR_PROSPECTO_BECA = PB.CORR_PROSPECTO_BECA
                        AND R.CORR_PREGUNTA_BECA = P.CORR_PREGUNTA_BECA
                  );";
            cmd.Parameters.Add(new SqlParameter("@Solicitud", solicitud));
            cmd.Parameters.Add(new SqlParameter("@Pregunta", pregunta));
            cmd.Parameters.Add(new SqlParameter("@Empresa", empresa));
            await using var rd = await cmd.ExecuteReaderAsync();
            if (!await rd.ReadAsync())
                return null;
            return new PreguntaEdicion { Tipo = rd.GetString(0), Codigo = rd.GetString(1) };
        }

        private async Task ActualizarFilaAsync(SqlConnection cn, SqlTransaction tx, int empresa, string usuario, AcaProspectoBecaRespuestaEdicion edicion, PreguntaEdicion pregunta, AcaProspectoBecaRespuestaFilaEdicion fila)
        {
            var tipo = pregunta.Tipo ?? "";
            var esOpcion = tipo is "OPCION_UNICA" or "OPCION_MULTIPLE" or "SI_NO";
            var esNumero = tipo is "NUMERO" or "DECIMAL";
            string textoOpcion = null;
            decimal puntaje = 0;

            if (esOpcion)
            {
                if (fila.CORR_OPCION_BECA <= 0)
                    throw new InvalidOperationException("Seleccione una opción");
                await using var op = cn.CreateCommand();
                op.Transaction = tx;
                op.CommandText = @"
                    SELECT O.TEXTO_OPCION, ISNULL(PU.PUNTAJE, 0)
                    FROM dbo.ACA_PROSPECTO_BECA_OPCION O
                    OUTER APPLY (
                        SELECT TOP (1) PUNTAJE
                        FROM dbo.ACA_PROSPECTO_BECA_PUNTAJE
                        WHERE ACTIVO = 1 AND CORR_OPCION_BECA = O.CORR_OPCION_BECA
                        ORDER BY FECHA_INICIO DESC, CORR_PUNTAJE_BECA DESC
                    ) PU
                    WHERE O.CORR_OPCION_BECA = @Opcion
                      AND O.CORR_PREGUNTA_BECA = @Pregunta
                      AND O.ACTIVO = 1;";
                op.Parameters.Add(new SqlParameter("@Opcion", fila.CORR_OPCION_BECA));
                op.Parameters.Add(new SqlParameter("@Pregunta", edicion.CORR_PREGUNTA_BECA));
                await using var rd = await op.ExecuteReaderAsync();
                if (!await rd.ReadAsync())
                    throw new InvalidOperationException("La opción no pertenece a esta pregunta");
                textoOpcion = rd.GetString(0);
                puntaje = rd.GetDecimal(1);
            }
            else if (esNumero)
            {
                if (fila.RESPUESTA_NUMERO == null)
                    throw new InvalidOperationException("Escriba un valor numérico");
                var numero = fila.RESPUESTA_NUMERO.Value;
                if (tipo == "DECIMAL" && (numero < 0 || numero > 10))
                    throw new InvalidOperationException("El promedio o la calificación debe estar entre 0 y 10");
                if (tipo == "NUMERO" && numero < 0)
                    throw new InvalidOperationException("El número no puede ser negativo");
            }

            await using var cmd = cn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                UPDATE R
                SET CORR_OPCION_BECA = CASE WHEN @EsOpcion = 1 THEN @Opcion ELSE R.CORR_OPCION_BECA END,
                    TEXTO_OPCION_HISTORICO = CASE WHEN @EsOpcion = 1 THEN @TextoOpcion ELSE R.TEXTO_OPCION_HISTORICO END,
                    RESPUESTA_TEXTO = CASE WHEN @EsTexto = 1 THEN @Texto ELSE R.RESPUESTA_TEXTO END,
                    RESPUESTA_NUMERO = CASE WHEN @EsNumero = 1 THEN @Numero ELSE R.RESPUESTA_NUMERO END,
                    PUNTAJE_OBTENIDO = CASE WHEN @EsOpcion = 1 THEN @Puntaje ELSE R.PUNTAJE_OBTENIDO END,
                    PORCENTAJE_APLICADO = CASE WHEN @EsOpcion = 1 THEN @Puntaje ELSE R.PORCENTAJE_APLICADO END,
                    USUARIO_ACTU = @Usuario,
                    ESTACION_ACTU = @Estacion,
                    FECHA_ACTU = GETDATE()
                FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                INNER JOIN dbo.ACA_PROSPECTO_BECA PB ON PB.CORR_PROSPECTO_BECA = R.CORR_PROSPECTO_BECA
                WHERE R.CORR_RESPUESTA_BECA = @Respuesta
                  AND R.CORR_PROSPECTO_BECA = @Solicitud
                  AND R.CORR_PREGUNTA_BECA = @Pregunta
                  AND PB.CORR_EMPRESA = @Empresa;";
            cmd.Parameters.Add(new SqlParameter("@EsOpcion", esOpcion ? 1 : 0));
            cmd.Parameters.Add(new SqlParameter("@EsTexto", tipo is "TEXTO" or "TEXTO_LARGO" or "ACEPTACION" ? 1 : 0));
            cmd.Parameters.Add(new SqlParameter("@EsNumero", esNumero ? 1 : 0));
            cmd.Parameters.Add(new SqlParameter("@Opcion", fila.CORR_OPCION_BECA <= 0 ? (object)DBNull.Value : fila.CORR_OPCION_BECA));
            cmd.Parameters.Add(new SqlParameter("@TextoOpcion", (object)textoOpcion ?? DBNull.Value));
            cmd.Parameters.Add(new SqlParameter("@Texto", (object)fila.RESPUESTA_TEXTO ?? DBNull.Value));
            cmd.Parameters.Add(new SqlParameter("@Numero", fila.RESPUESTA_NUMERO.HasValue ? fila.RESPUESTA_NUMERO.Value : (object)DBNull.Value));
            cmd.Parameters.Add(new SqlParameter("@Puntaje", puntaje));
            cmd.Parameters.Add(new SqlParameter("@Usuario", usuario));
            cmd.Parameters.Add(new SqlParameter("@Estacion", Environment.MachineName.Length > 30 ? Environment.MachineName.Substring(0, 30) : Environment.MachineName));
            cmd.Parameters.Add(new SqlParameter("@Respuesta", fila.CORR_RESPUESTA_BECA));
            cmd.Parameters.Add(new SqlParameter("@Solicitud", edicion.CORR_PROSPECTO_BECA));
            cmd.Parameters.Add(new SqlParameter("@Pregunta", edicion.CORR_PREGUNTA_BECA));
            cmd.Parameters.Add(new SqlParameter("@Empresa", empresa));
            var rows = await cmd.ExecuteNonQueryAsync();
            if (rows == 0)
                throw new InvalidOperationException("No se encontró la respuesta a modificar");
        }

        private async Task AplicarBandasAsync(SqlConnection cn, SqlTransaction tx, int solicitud)
        {
            await using var cmd = cn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                DECLARE @Promedio decimal(18, 4);
                DECLARE @Destino int;
                DECLARE @Puntaje decimal(10, 2);

                SELECT @Promedio = AVG(R.RESPUESTA_NUMERO)
                FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
                WHERE R.CORR_PROSPECTO_BECA = @Solicitud
                  AND P.CODIGO_PREGUNTA IN ('ACA_PROMEDIO_PRIMERO', 'ACA_PROMEDIO_SEGUNDO', 'ACA_PROMEDIO_TERCERO')
                  AND R.RESPUESTA_NUMERO IS NOT NULL;

                SELECT TOP (1) @Destino = R.CORR_PREGUNTA_BECA
                FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
                WHERE R.CORR_PROSPECTO_BECA = @Solicitud
                  AND P.CODIGO_PREGUNTA IN ('ACA_PROMEDIO_PRIMERO', 'ACA_PROMEDIO_SEGUNDO', 'ACA_PROMEDIO_TERCERO')
                  AND R.RESPUESTA_NUMERO IS NOT NULL
                ORDER BY P.ORDEN DESC, R.CORR_RESPUESTA_BECA DESC;

                SET @Puntaje = CASE
                    WHEN @Promedio IS NULL THEN 0
                    WHEN @Promedio >= 9 THEN 35
                    WHEN @Promedio >= 8.5 THEN 30
                    WHEN @Promedio >= 8 THEN 25
                    WHEN @Promedio >= 7 THEN 18
                    WHEN @Promedio >= 6 THEN 8
                    ELSE 0
                END;

                UPDATE R
                SET PUNTAJE_OBTENIDO = CASE WHEN R.CORR_PREGUNTA_BECA = @Destino THEN @Puntaje ELSE 0 END,
                    PORCENTAJE_APLICADO = CASE WHEN R.CORR_PREGUNTA_BECA = @Destino THEN @Puntaje ELSE 0 END
                FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
                WHERE R.CORR_PROSPECTO_BECA = @Solicitud
                  AND P.CODIGO_PREGUNTA IN ('ACA_PROMEDIO_PRIMERO', 'ACA_PROMEDIO_SEGUNDO', 'ACA_PROMEDIO_TERCERO');

                UPDATE R
                SET PUNTAJE_OBTENIDO = CASE
                        WHEN R.RESPUESTA_NUMERO >= 5 THEN 0
                        WHEN R.RESPUESTA_NUMERO >= 3 THEN 1
                        WHEN R.RESPUESTA_NUMERO >= 1 THEN 3
                        WHEN R.RESPUESTA_NUMERO = 0 THEN 5
                        ELSE 0
                    END,
                    PORCENTAJE_APLICADO = CASE
                        WHEN R.RESPUESTA_NUMERO >= 5 THEN 0
                        WHEN R.RESPUESTA_NUMERO >= 3 THEN 1
                        WHEN R.RESPUESTA_NUMERO >= 1 THEN 3
                        WHEN R.RESPUESTA_NUMERO = 0 THEN 5
                        ELSE 0
                    END
                FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
                WHERE R.CORR_PROSPECTO_BECA = @Solicitud
                  AND P.CODIGO_PREGUNTA = 'SOC_DEPENDIENTES_ECONOMICOS'
                  AND R.RESPUESTA_NUMERO IS NOT NULL;";
            cmd.Parameters.Add(new SqlParameter("@Solicitud", solicitud));
            await cmd.ExecuteNonQueryAsync();
        }

        private async Task RecalcularTotalesAsync(SqlConnection cn, SqlTransaction tx, int solicitud)
        {
            await using (var del = cn.CreateCommand())
            {
                del.Transaction = tx;
                del.CommandText = "DELETE FROM dbo.ACA_PROSPECTO_BECA_SECCION_RESULTADO WHERE CORR_PROSPECTO_BECA = @Solicitud;";
                del.Parameters.Add(new SqlParameter("@Solicitud", solicitud));
                await del.ExecuteNonQueryAsync();
            }

            await using (var ins = cn.CreateCommand())
            {
                ins.Transaction = tx;
                ins.CommandText = @"
                    INSERT INTO dbo.ACA_PROSPECTO_BECA_SECCION_RESULTADO
                        (CORR_PROSPECTO_BECA, CORR_SECCION_BECA, PUNTAJE_OBTENIDO, PORCENTAJE_OBTENIDO, PORCENTAJE_SECCION_HISTORICO, FECHA_CALCULO, CORR_EMPRESA)
                    SELECT @Solicitud, S.CORR_SECCION_BECA, ISNULL(SUM(R.PUNTAJE_OBTENIDO), 0), ISNULL(SUM(R.PORCENTAJE_APLICADO), 0),
                           S.PORCENTAJE_SECCION, GETDATE(), PB.CORR_EMPRESA
                    FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA R
                    INNER JOIN dbo.ACA_PROSPECTO_BECA_PREGUNTA P ON P.CORR_PREGUNTA_BECA = R.CORR_PREGUNTA_BECA
                    INNER JOIN dbo.ACA_PROSPECTO_BECA_SECCION S ON S.CORR_SECCION_BECA = P.CORR_SECCION_BECA
                    INNER JOIN dbo.ACA_PROSPECTO_BECA PB ON PB.CORR_PROSPECTO_BECA = R.CORR_PROSPECTO_BECA
                    WHERE R.CORR_PROSPECTO_BECA = @Solicitud
                    GROUP BY S.CORR_SECCION_BECA, S.PORCENTAJE_SECCION, PB.CORR_EMPRESA;";
                ins.Parameters.Add(new SqlParameter("@Solicitud", solicitud));
                await ins.ExecuteNonQueryAsync();
            }

            await using var upd = cn.CreateCommand();
            upd.Transaction = tx;
            upd.CommandText = @"
                UPDATE PB
                SET PUNTAJE_TOTAL = ISNULL(T.PUNTAJE_TOTAL, 0),
                    PORCENTAJE_TOTAL = CAST(ISNULL(T.PORCENTAJE_TOTAL, 0) AS decimal(5, 2)),
                    RESULTADO_EVALUACION = CASE
                        WHEN ISNULL(T.PUNTAJE_TOTAL, 0) >= 85 THEN 'Potencialmente elegible'
                        WHEN ISNULL(T.PUNTAJE_TOTAL, 0) >= 70 THEN 'Potencialmente elegible'
                        WHEN ISNULL(T.PUNTAJE_TOTAL, 0) >= 55 THEN 'Elegibilidad condicionada'
                        ELSE 'Baja viabilidad actual'
                    END,
                    PRIORIDAD_EVALUACION = CASE
                        WHEN ISNULL(T.PUNTAJE_TOTAL, 0) >= 85 THEN 'ALTA'
                        WHEN ISNULL(T.PUNTAJE_TOTAL, 0) >= 70 THEN 'MEDIA'
                        WHEN ISNULL(T.PUNTAJE_TOTAL, 0) >= 55 THEN 'CONDICIONADA'
                        ELSE 'BAJA'
                    END,
                    FECHA_ACTU = GETDATE()
                FROM dbo.ACA_PROSPECTO_BECA PB
                OUTER APPLY (
                    SELECT SUM(PUNTAJE_OBTENIDO) AS PUNTAJE_TOTAL, SUM(PORCENTAJE_APLICADO) AS PORCENTAJE_TOTAL
                    FROM dbo.ACA_PROSPECTO_BECA_RESPUESTA
                    WHERE CORR_PROSPECTO_BECA = PB.CORR_PROSPECTO_BECA
                ) T
                WHERE PB.CORR_PROSPECTO_BECA = @Solicitud;";
            upd.Parameters.Add(new SqlParameter("@Solicitud", solicitud));
            await upd.ExecuteNonQueryAsync();
        }

        private async Task<object> LeerTotalesAsync(SqlConnection cn, SqlTransaction tx, int solicitud)
        {
            await using var cmd = cn.CreateCommand();
            cmd.Transaction = tx;
            cmd.CommandText = @"
                SELECT PUNTAJE_TOTAL, PORCENTAJE_TOTAL, RESULTADO_EVALUACION, PRIORIDAD_EVALUACION
                FROM dbo.ACA_PROSPECTO_BECA
                WHERE CORR_PROSPECTO_BECA = @Solicitud;";
            cmd.Parameters.Add(new SqlParameter("@Solicitud", solicitud));
            await using var rd = await cmd.ExecuteReaderAsync();
            await rd.ReadAsync();
            return new
            {
                PUNTAJE_TOTAL = rd.GetDecimal(0),
                PORCENTAJE_TOTAL = rd.GetDecimal(1),
                RESULTADO_EVALUACION = rd.IsDBNull(2) ? "" : rd.GetString(2),
                PRIORIDAD_EVALUACION = rd.IsDBNull(3) ? "" : rd.GetString(3),
            };
        }

        private static string LimpiarNombre(string nombre)
        {
            var limpio = new string((nombre ?? "archivo").Where(c => char.IsLetterOrDigit(c) || c == ' ' || c == '-' || c == '_').ToArray()).Trim();
            if (string.IsNullOrWhiteSpace(limpio))
                limpio = "archivo";
            return limpio.Length > 80 ? limpio.Substring(0, 80) : limpio;
        }

        private sealed class PreguntaEdicion
        {
            public string Tipo { get; set; }
            public string Codigo { get; set; }
        }
    }
}
