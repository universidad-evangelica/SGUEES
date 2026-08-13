// Qué hace: acceso a datos de las unidades asignadas directamente a usuarios.
// Cómo: lee V_SC_UNIDADES_USUARIO, escribe SC_UNIDADES_USUARIO y ejecuta operaciones masivas parametrizadas.
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class SC_UNIDADES_USUARIORepository : BaseRepository<SC_UNIDADES_USUARIOTable>, ISC_UNIDADES_USUARIORepository
    {
        private const string _TableName = "SC_UNIDADES_USUARIO";
        private const string _ViewName = "V_SC_UNIDADES_USUARIO";
        private const string _SpDataUnidadesUsuario = "PRAL_DATA_SC_UNIDADES_USUARIO";
        private readonly string _connectionString;

        public SC_UNIDADES_USUARIORepository(IConfiguration config)
            : base(config.GetConnectionString("defaultConnection"), config.GetSection("DbProvider:defaultProvider").Value)
        {
            _connectionString = config.GetConnectionString("defaultConnection") ?? string.Empty;
        }

        // Qué hace: indica si una unidad ya está asignada al usuario.
        // Cómo: consulta la vista por las tres columnas de la llave primaria.
        public async Task<bool> ExistsAsync(int corrEmpresa, int corrUnidad, string loginSistema)
        {
            var result = await GetAsync(new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                new CParameter() { ParameterName = "CORR_UNIDAD", Value = corrUnidad, DbType = DbType.Int32 },
                new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = loginSistema, DbType = DbType.String },
            });
            return result.Result && result.Data != null;
        }

        // Qué hace: lista las asignaciones de unidades por usuario.
        // Cómo: consulta la vista con filtros y ordena por LOGIN_SISTEMA y CORR_UNIDAD.
        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_UNIDADES_USUARIOView>().FromDataReader(reader)
                    .OrderBy(x => x.LOGIN_SISTEMA)
                    .ThenBy(x => x.CORR_UNIDAD)
                    .ToList();
                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response.Count;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e);
            }
            finally
            {
                objData.objConnection.Close();
            }
            return result;
        }

        // Qué hace: lista las unidades efectivas del usuario (puesto + configuradas).
        // Cómo: ejecuta PRAL_DATA_SC_UNIDADES_USUARIO con CORR_EMPRESA y LOGIN_SISTEMA.
        public async Task<CResult> GetUnidadesUsuarioAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try
            {
                var reader = await objData.GetDataReader(CommandType.StoredProcedure, _SpDataUnidadesUsuario, xWhere);
                var response = new List<SC_UNIDADES_USUARIOView>().FromDataReader(reader)
                    .OrderBy(x => x.CODIGO_UNIDAD)
                    .ThenBy(x => x.CORR_UNIDAD)
                    .ToList();
                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response.Count;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e);
            }
            finally
            {
                objData.objConnection.Close();
            }
            return result;
        }

        // Qué hace: obtiene una asignación específica.
        // Cómo: consulta la vista con los filtros recibidos y toma el primer registro.
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<SC_UNIDADES_USUARIOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e);
            }
            finally
            {
                objData.objConnection.Close();
            }
            return result;
        }

        // Qué hace: crea una asignación de unidad a usuario.
        // Cómo: inserta los campos de tabla y recupera la fila mediante la llave compuesta.
        public async Task<CResult> CreateAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try
            {
                var reader = await objData.Insert(_TableName, BuildWriteParameters(Data), string.Empty, BuildKeys(Data));
                var response = new List<SC_UNIDADES_USUARIOView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = 1;
                result.CodeHelper = Data.CORR_UNIDAD;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e, IsDuplicateKeyError(e) ? 2627 : -1,
                    IsDuplicateKeyError(e) ? "Esa unidad ya esta asignada al usuario." : e.Message);
            }
            finally
            {
                objData.objConnection.Close();
            }
            return result;
        }

        // Qué hace: bloquea la modificación directa de la llave compuesta.
        // Cómo: devuelve un resultado fallido para obligar a eliminar y volver a asignar.
        public Task<CResult> UpdateAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            return Task.FromResult(new CResult
            {
                Data = null,
                Result = false,
                ErrorCode = -1,
                ErrorMessage = "La actualizacion de unidades por usuario no esta habilitada. Elimine y vuelva a asignar.",
                ErrorSource = "[SC_UNIDADES_USUARIORepository]",
                RowsAffected = 0
            });
        }

        // Qué hace: elimina una asignación unidad-usuario.
        // Cómo: ejecuta Delete con CORR_EMPRESA, CORR_UNIDAD y LOGIN_SISTEMA.
        public async Task<CResult> DeleteAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try
            {
                await objData.Delete(_TableName, BuildKeys(Data));
                result.Data = null;
                result.Result = true;
                result.RowsAffected = 1;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e);
            }
            finally
            {
                objData.objConnection.Close();
            }
            return result;
        }

        // Qué hace: asigna al usuario todas las unidades activas pendientes.
        // Cómo: ejecuta INSERT SELECT con NOT EXISTS y parámetros de empresa, usuario y auditoría.
        public async Task<CResult> AsignarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            const string sql = @"
            INSERT INTO SC_UNIDADES_USUARIO (
                CORR_EMPRESA, CORR_UNIDAD, LOGIN_SISTEMA,
                USUARIO_CREA, ESTACION_CREA, FECHA_CREA,
                USUARIO_ACTU, ESTACION_ACTU, FECHA_ACTU
            )
            SELECT
                @CORR_EMPRESA, U.CORR_UNIDAD, @LOGIN_SISTEMA,
                @USUARIO, @ESTACION, GETDATE(),
                @USUARIO, @ESTACION, GETDATE()
            FROM SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES U
            WHERE U.CORR_EMPRESA = @CORR_EMPRESA
            AND ISNULL(U.ACTIVO, 1) = 1
            AND NOT EXISTS (
                SELECT 1 FROM SC_UNIDADES_USUARIO X
                WHERE X.CORR_EMPRESA = U.CORR_EMPRESA
                AND X.CORR_UNIDAD = U.CORR_UNIDAD
                AND X.LOGIN_SISTEMA = @LOGIN_SISTEMA
            );";
            return await ExecuteBulkAsync(sql, Data, vUSER_SISTEMA, vESTACION, true);
        }

        // Qué hace: quita todas las unidades asignadas al usuario.
        // Cómo: ejecuta DELETE parametrizado por empresa y LOGIN_SISTEMA.
        public async Task<CResult> QuitarTodasUnidadesAsync(SC_UNIDADES_USUARIOTable Data, string vUSER_SISTEMA, string vESTACION)
        {
            const string sql = @"
            DELETE FROM SC_UNIDADES_USUARIO
            WHERE CORR_EMPRESA = @CORR_EMPRESA
            AND LOGIN_SISTEMA = @LOGIN_SISTEMA;";
            return await ExecuteBulkAsync(sql, Data, vUSER_SISTEMA, vESTACION, false);
        }

        // Qué hace: ejecuta las operaciones masivas de asignación o retiro.
        // Cómo: abre SqlConnection, agrega parámetros tipados y devuelve las filas afectadas.
        private async Task<CResult> ExecuteBulkAsync(string sql, SC_UNIDADES_USUARIOTable Data, string user, string station, bool assigning)
        {
            CResult result = new();
            try
            {
                await using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();
                await using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.Add(new SqlParameter("@CORR_EMPRESA", SqlDbType.Int) { Value = Data.CORR_EMPRESA });
                cmd.Parameters.Add(new SqlParameter("@LOGIN_SISTEMA", SqlDbType.VarChar, 30) { Value = Data.LOGIN_SISTEMA });
                if (assigning)
                {
                    cmd.Parameters.Add(new SqlParameter("@USUARIO", SqlDbType.VarChar, 50) { Value = user ?? string.Empty });
                    cmd.Parameters.Add(new SqlParameter("@ESTACION", SqlDbType.VarChar, 50) { Value = station ?? string.Empty });
                }
                var rows = await cmd.ExecuteNonQueryAsync();
                result.Data = new { CANTIDAD = rows };
                result.Result = true;
                result.RowsAffected = rows;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e);
            }
            return result;
        }

        // Qué hace: arma las llaves para consultar, insertar o eliminar.
        // Cómo: convierte la PK compuesta en parámetros tipados de CData.
        private static List<CParameter> BuildKeys(SC_UNIDADES_USUARIOTable Data) => new()
        {
            new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
            new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = DbType.Int32 },
            new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = DbType.String },
        };

        // Qué hace: arma todos los parámetros de escritura.
        // Cómo: mapea llaves y auditoría desde el modelo de tabla.
        private static List<CParameter> BuildWriteParameters(SC_UNIDADES_USUARIOTable Data) => new()
        {
            new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
            new CParameter() { ParameterName = "CORR_UNIDAD", Value = Data.CORR_UNIDAD, DbType = DbType.Int32 },
            new CParameter() { ParameterName = "LOGIN_SISTEMA", Value = Data.LOGIN_SISTEMA, DbType = DbType.String },
            new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = DbType.String },
            new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = DbType.String },
            new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = DbType.DateTime },
            new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = DbType.String },
            new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = DbType.String },
            new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = DbType.DateTime },
        };

        // Qué hace: completa un resultado fallido de repositorio.
        // Cómo: normaliza excepción, código y origen para consumo del servicio.
        private static void SetError(CResult result, Exception e, int code = -1, string message = null)
        {
            result.Data = null;
            result.Result = false;
            result.ErrorCode = code;
            result.ErrorMessage = message ?? e.Message;
            result.ErrorSource = $"[{e.Source}]";
            result.RowsAffected = 0;
        }

        // Qué hace: reconoce una violación de llave única.
        // Cómo: revisa los textos estándar de SQL Server en la excepción.
        private static bool IsDuplicateKeyError(Exception e) =>
            e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
            e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
            e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
    }
}
