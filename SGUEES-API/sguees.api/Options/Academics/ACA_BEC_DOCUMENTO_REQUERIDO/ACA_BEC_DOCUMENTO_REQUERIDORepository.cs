using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
    public class ACA_BEC_DOCUMENTO_REQUERIDORepository : BaseRepository<ACA_BEC_DOCUMENTO_REQUERIDOTable>, IACA_BEC_DOCUMENTO_REQUERIDORepository
    {
        private const string _TableName = "ACA_BEC_DOCUMENTO_REQUERIDO";
        private const string _ViewName = "V_ACA_BEC_DOCUMENTO_REQUERIDO";
        private const string _CampoPk = "CORR_BECA_DOCUMENTO_REQUERIDO";
        private const string _CampoEstado = "ACTIVO";
        private const bool _UsaEmpresa = true;

        public ACA_BEC_DOCUMENTO_REQUERIDORepository(IConfiguration config) :
            base(config.GetConnectionString("defaultConnection"),
                config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult result = new();

            try
            {
                var dbWhere = xWhere
                    .Where(x => x.ParameterName == "CORR_EMPRESA" ||
                        x.ParameterName == "CORR_BECA_DOCUMENTO_REQUERIDO" ||
                        x.ParameterName == "CORR_BECA" ||
                        x.ParameterName == "NOMBRE_DOCUMENTO" ||
                        x.ParameterName == "AREA_RECEPTORA" ||
                        x.ParameterName == "OBLIGATORIO" ||
                        x.ParameterName == "ACTIVO")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<ACA_BEC_DOCUMENTO_REQUERIDOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_BECA)
                    .ThenBy(x => x.CORR_BECA_DOCUMENTO_REQUERIDO)
                    .ToList();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response.Count;
                result.CodeHelper = 0;
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

        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult result = new();

            try
            {
                var reader = await objData.GetDataReader(_ViewName, xWhere);
                var response = new List<ACA_BEC_DOCUMENTO_REQUERIDOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_BECA_DOCUMENTO_REQUERIDO ?? 0;
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

        public Task<CResult> CreateAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(1, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> UpdateAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(2, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> DeleteAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(3, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> ActivarInactivarAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(4, Data, vLOGIN_SISTEMA, vESTACION);

        public async Task<CResult> GetTiposBecaAsync(int corrEmpresa)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ESTADO_BECA", Value = "ACTIVA", DbType = System.Data.DbType.String },
                };

                var reader = await objData.GetDataReader("V_ACA_BEC_TIPO", p);
                var response = new List<ACA_BEC_DOCUMENTO_REQUERIDO_TIPOLookup>().FromDataReader(reader)
                    .OrderBy(x => x.NOMBRE_BECA)
                    .ToList();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response.Count;
                result.CodeHelper = 0;
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





        private static List<CParameter> BuildCompanyWhere(ACA_BEC_DOCUMENTO_REQUERIDOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static List<CParameter> BuildPrimaryWhere(ACA_BEC_DOCUMENTO_REQUERIDOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_BECA_DOCUMENTO_REQUERIDO", Value = Data.CORR_BECA_DOCUMENTO_REQUERIDO, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void SetDuplicateAwareError(CResult result, Exception e)
        {
            SetError(result, e, 0, IsDuplicateKeyError(e)
                ? "Ya existe un documento requerido con ese identificador."
                : e.Message,
                IsDuplicateKeyError(e) ? 2627 : -1);
        }

        private static void SetError(CResult result, Exception e, int codeHelper = 0, string message = null, int errorCode = -1)
        {
            result.Data = null;
            result.Result = false;
            result.CodeHelper = codeHelper;
            result.ErrorCode = errorCode;
            result.ErrorMessage = message ?? e.Message;
            result.ErrorSource += $"[{e.Source}]";
        }

        private static bool IsDuplicateKeyError(Exception e)
        {
            return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
                e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
        }

        private async Task<CResult> WriteAsync(int operation, ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string user, string station)
        {
            if (Data == null) return new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." };
            try
            {
                var p = new List<CParameter> {
                    new() { ParameterName="@TIPO_ACTUALIZA",Value=operation,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@ID",Value=Data.CORR_BECA_DOCUMENTO_REQUERIDO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName="@USUARIO",Value=user??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ESTACION",Value=station??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CORR_BECA",Value=(object)Data.CORR_BECA??DBNull.Value,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@NOMBRE_DOCUMENTO",Value=(object)Data.NOMBRE_DOCUMENTO??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@AREA_RECEPTORA",Value=(object)Data.AREA_RECEPTORA??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@OBLIGATORIO",Value=(object)Data.OBLIGATORIO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@ACTIVO",Value=(object)Data.ACTIVO??DBNull.Value,DbType=System.Data.DbType.Boolean }
                };
                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_ACA_BEC_DOCUMENTO_REQUERIDO", true, p);
                Data.CORR_BECA_DOCUMENTO_REQUERIDO = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                objData.objConnection.Close();
                if (operation == 3) return new CResult { Result = true, CodeHelper = Data.CORR_BECA_DOCUMENTO_REQUERIDO, RowsAffected = 1 };
                var result = await GetAsync(new List<CParameter>{
                    new(){ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new(){ParameterName="CORR_BECA_DOCUMENTO_REQUERIDO",Value=Data.CORR_BECA_DOCUMENTO_REQUERIDO,DbType=System.Data.DbType.Int32}
                });
                result.CodeHelper = Data.CORR_BECA_DOCUMENTO_REQUERIDO; result.RowsAffected = result.Data == null ? 0 : 1; return result;
            }
            catch (Exception ex) { return new CResult { ErrorCode = -1, ErrorMessage = ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
    }
}

