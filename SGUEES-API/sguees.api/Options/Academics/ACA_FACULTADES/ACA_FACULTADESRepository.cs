using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
    // Qué hace: acceso a dbo.ACA_FACULTADES y su vista V_ACA_FACULTADES.
    // Cómo lo hace: patrón A+ con estado de catálogo. CORR_FACULTAD es IDENTITY, así que el alta no genera la
    //               llave (MAX+1) y relee la fila nueva por su código, que es único por empresa.
    public class ACA_FACULTADESRepository : BaseRepository<ACA_FACULTADESTable>, IACA_FACULTADESRepository
    {
        private const string _TableName = "ACA_FACULTADES";
        private const string _ViewName = "V_ACA_FACULTADES";
        private const string _CampoPk = "CORR_FACULTAD";
        private const string _CampoEstado = "ACTIVO";
        private const bool _UsaEmpresa = true;

        // Las escrituras verifican carreras, períodos, historial y ciclos en una transacción SQL.

        public ACA_FACULTADESRepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();
            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA" ||
                        x.ParameterName == "CORR_FACULTAD" ||
                        x.ParameterName == "CODIGO_FACULTAD" ||
                        x.ParameterName == "NOMBRE_FACULTAD" ||
                        x.ParameterName == "ACTIVO")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<ACA_FACULTADESView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_FACULTAD)
                    .ToList();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response.Count, 0);
            }
            catch (Exception e)
            {
                objResultado = Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();
            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_FACULTADESView>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                reader = null;

                objResultado = Ok(response, response == null ? 0 : 1, response?.CORR_FACULTAD ?? 0);
            }
            catch (Exception e)
            {
                objResultado = Error(-1, e.Message, e.Source);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> CreateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        { return await Configurar("CREAR", Data, vLOGIN_SISTEMA, vESTACION); }

        public async Task<CResult> UpdateAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        { return await Configurar("GUARDAR", Data, vLOGIN_SISTEMA, vESTACION); }

        public async Task<CResult> DeleteAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        { return await Configurar("ELIMINAR", Data, vLOGIN_SISTEMA, vESTACION); }

        public async Task<CResult> ActivarInactivarAsync(ACA_FACULTADESTable Data, string vLOGIN_SISTEMA, string vESTACION)
        { return await Configurar("ESTADO", Data, vLOGIN_SISTEMA, vESTACION); }

        private async Task<CResult> Configurar(string operation, ACA_FACULTADESTable Data, string user, string station)
        {
            try
            {
                var p = new List<CParameter> {
                    new() { ParameterName="@OPERACION", DbType=System.Data.DbType.AnsiString, Value=(object)(operation) ?? DBNull.Value },
                    new() { ParameterName="@EMPRESA", DbType=System.Data.DbType.Int32, Value=(object)(Data.CORR_EMPRESA) ?? DBNull.Value },
                    new() { ParameterName="@FACULTAD", DbType=System.Data.DbType.Int32, Value=(object)(Data.CORR_FACULTAD) ?? DBNull.Value, Direction=System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName="@SEDE", DbType=System.Data.DbType.Int32, Value=(object)(null) ?? DBNull.Value },
                    new() { ParameterName="@DECANO", DbType=System.Data.DbType.Int32, Value=(object)(Data.CORR_DECANO) ?? DBNull.Value },
                    new() { ParameterName="@CODIGO", DbType=System.Data.DbType.AnsiString, Value=(object)(Data.CODIGO_FACULTAD) ?? DBNull.Value },
                    new() { ParameterName="@NOMBRE", DbType=System.Data.DbType.AnsiString, Value=(object)(Data.NOMBRE_FACULTAD) ?? DBNull.Value },
                    new() { ParameterName="@ACTIVO", DbType=System.Data.DbType.Boolean, Value=(object)(Data.ACTIVO??true) ?? DBNull.Value },
                    new() { ParameterName="@USUARIO", DbType=System.Data.DbType.AnsiString, Value=(object)(user) ?? DBNull.Value },
                    new() { ParameterName="@ESTACION", DbType=System.Data.DbType.AnsiString, Value=(object)(station) ?? DBNull.Value }
                };
                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PR_ACA_FACULTAD_CONFIGURAR", true, p);
                var id = Convert.ToInt32(objData.objCommand.Parameters["@FACULTAD"].Value);
                objData.objConnection.Close();
                if (operation.EndsWith("ELIMINAR")) return Ok(null, 1, id);
                Data.CORR_FACULTAD = id;
                var result = await GetAsync(new List<CParameter> { new() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 }, new() { ParameterName = "CORR_FACULTAD", Value = id, DbType = System.Data.DbType.Int32 } }); result.RowsAffected = 1; result.CodeHelper = id; return result;
            }
            catch (Exception ex) { return Error(-1, ex.Message, ex.Source); }
            finally { objData.objConnection.Close(); }
        }

        private static CResult Ok(object data, int rows, int codeHelper)
        {
            return new CResult
            {
                Data = data,
                Result = true,
                RowsAffected = rows,
                CodeHelper = codeHelper,
                ErrorCode = 0,
                ErrorMessage = string.Empty,
                ErrorSource = string.Empty
            };
        }

        private static CResult Error(int code, string message, string source)
        {
            return new CResult
            {
                Data = null,
                Result = false,
                RowsAffected = 0,
                CodeHelper = 0,
                ErrorCode = code,
                ErrorMessage = message,
                ErrorSource = $"[{source}]"
            };
        }

        // Cómo lo hace: el servidor responde en español ("clave duplicada"), por eso también se busca el índice único.
        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("UQ_ACA_FACULTADES_CODIGO", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("duplicad", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }
    }
}
