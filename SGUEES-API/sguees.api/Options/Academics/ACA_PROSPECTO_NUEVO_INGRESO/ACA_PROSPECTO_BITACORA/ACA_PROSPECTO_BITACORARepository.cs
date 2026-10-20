using System;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: lee y guarda la bitácora de cambios de nuevo ingreso.
    // Cómo lo hace: consulta la vista y, al insertar, toma el siguiente correlativo porque la llave no es identity.
    public class ACA_PROSPECTO_BITACORARepository : IACA_PROSPECTO_BITACORARepository
    {
        private readonly string _connectionString;

        public ACA_PROSPECTO_BITACORARepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("defaultConnection");
        }

        public async Task<CResult> GetAllAsync(int corrProspecto)
        {
            try
            {
                var filas = new System.Collections.Generic.List<ACA_PROSPECTO_BITACORAView>();
                await using var cn = new SqlConnection(_connectionString);
                await cn.OpenAsync();
                await using var cmd = cn.CreateCommand();
                cmd.CommandText = @"
                    SELECT CORR_PROSPECTO_BITACORA, CORR_PROSPECTO, LOGIN_SISTEMA, COMENTARIO, TIPO_PROSPECTO, FECHA_ACCION
                    FROM dbo.V_ACA_PROSPECTO_BITACORA
                    WHERE CORR_PROSPECTO = @Prospecto
                      AND TIPO_PROSPECTO = 'ACA_PROSPECTO'
                    ORDER BY FECHA_ACCION DESC, CORR_PROSPECTO_BITACORA DESC;";
                cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                await using var rd = await cmd.ExecuteReaderAsync();
                while (await rd.ReadAsync())
                {
                    filas.Add(Leer(rd));
                }

                return new CResult { Result = true, Data = filas, RowsAffected = filas.Count };
            }
            catch (Exception ex)
            {
                return Error(ex.Message);
            }
        }

        public async Task<CResult> InsertAsync(int corrProspecto, string comentario, string login, string estacion)
        {
            await using var cn = new SqlConnection(_connectionString);
            await cn.OpenAsync();
            await using var tx = (SqlTransaction)await cn.BeginTransactionAsync();
            try
            {
                await using var cmd = cn.CreateCommand();
                cmd.Transaction = tx;
                cmd.CommandText = @"
                    DECLARE @Nuevo int;
                    SELECT @Nuevo = ISNULL(MAX(CORR_PROSPECTO_BITACORA), 0) + 1
                    FROM dbo.ACA_PROSPECTO_BITACORA WITH (UPDLOCK, HOLDLOCK);

                    INSERT INTO dbo.ACA_PROSPECTO_BITACORA (
                        CORR_PROSPECTO_BITACORA, LOGIN_SISTEMA, CORR_PROSPECTO, COMENTARIO,
                        TIPO_PROSPECTO, FECHA_ACCION, USUARIO_CREA, ESTACION_CREA, FECHA_CREA
                    )
                    VALUES (
                        @Nuevo, @Login, @Prospecto, @Comentario,
                        'ACA_PROSPECTO', GETDATE(), @Login, @Estacion, GETDATE()
                    );

                    SELECT CORR_PROSPECTO_BITACORA, CORR_PROSPECTO, LOGIN_SISTEMA, COMENTARIO, TIPO_PROSPECTO, FECHA_ACCION
                    FROM dbo.V_ACA_PROSPECTO_BITACORA
                    WHERE CORR_PROSPECTO_BITACORA = @Nuevo;";
                cmd.Parameters.Add(new SqlParameter("@Login", login.Length > 30 ? login.Substring(0, 30) : login));
                cmd.Parameters.Add(new SqlParameter("@Prospecto", corrProspecto));
                cmd.Parameters.Add(new SqlParameter("@Comentario", comentario));
                cmd.Parameters.Add(new SqlParameter("@Estacion", string.IsNullOrWhiteSpace(estacion) ? Environment.MachineName : estacion));
                await using var rd = await cmd.ExecuteReaderAsync();
                if (!await rd.ReadAsync())
                {
                    await tx.RollbackAsync();
                    return Error("No se pudo registrar la bitácora");
                }

                var fila = Leer(rd);
                await rd.CloseAsync();
                await tx.CommitAsync();
                return new CResult { Result = true, Data = fila, RowsAffected = 1, ErrorMessage = "Bitácora registrada" };
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return Error(ex.Message);
            }
        }

        private static ACA_PROSPECTO_BITACORAView Leer(SqlDataReader rd)
        {
            return new ACA_PROSPECTO_BITACORAView
            {
                CORR_PROSPECTO_BITACORA = rd.GetInt32(0),
                CORR_PROSPECTO = rd.IsDBNull(1) ? 0 : rd.GetInt32(1),
                LOGIN_SISTEMA = rd.IsDBNull(2) ? "" : rd.GetString(2),
                USUARIO = rd.IsDBNull(2) ? "" : rd.GetString(2),
                COMENTARIO = rd.IsDBNull(3) ? "" : rd.GetString(3),
                TIPO_PROSPECTO = rd.IsDBNull(4) ? "" : rd.GetString(4),
                FECHA_ACCION = rd.IsDBNull(5) ? null : rd.GetDateTime(5),
            };
        }

        private static CResult Error(string mensaje)
        {
            return new CResult() { Data = null, Result = false, ErrorCode = -1, ErrorMessage = mensaje };
        }
    }
}
