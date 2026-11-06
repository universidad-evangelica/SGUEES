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
    public class ACA_BEC_CONVENIORepository : BaseRepository<ACA_BEC_CONVENIOTable>, IACA_BEC_CONVENIORepository
    {
        private const string _TableName = "ACA_BEC_CONVENIO";
        private const string _ViewName = "V_ACA_BEC_CONVENIO";
        private const string _CampoPk = "CORR_CONVENIO";

        public ACA_BEC_CONVENIORepository(IConfiguration config) :
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
                        x.ParameterName == "CORR_CONVENIO" ||
                        x.ParameterName == "CODIGO_CONVENIO" ||
                        x.ParameterName == "NOMBRE_CONVENIO" ||
                        x.ParameterName == "CORR_ENTIDAD_FINANCIADORA" ||
                        x.ParameterName == "ESTADO_CONVENIO")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<ACA_BEC_CONVENIOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_CONVENIO)
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
                var response = new List<ACA_BEC_CONVENIOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_CONVENIO ?? 0;
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

        public Task<CResult> CreateAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(1, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> UpdateAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(2, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> DeleteAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(3, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> ActivarInactivarAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(4, Data, vLOGIN_SISTEMA, vESTACION);

        public async Task<CResult> GetEntidadesFinanciadorasAsync(int corrEmpresa)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ACTIVO", Value = true, DbType = System.Data.DbType.Boolean },
                };

                var reader = await objData.GetDataReader("V_ACA_BEC_ENTIDAD_FINANCIADORA", p);
                var response = new List<ACA_BEC_ENTIDAD_FINANCIADORALookup>().FromDataReader(reader)
                    .OrderBy(x => x.NOMBRE_ENTIDAD)
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





        private static List<CParameter> BuildCompanyWhere(ACA_BEC_CONVENIOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static List<CParameter> BuildPrimaryWhere(ACA_BEC_CONVENIOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_CONVENIO", Value = Data.CORR_CONVENIO, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void SetDuplicateAwareError(CResult result, Exception e)
        {
            SetError(result, e, 0, IsDuplicateKeyError(e)
                ? "Ya existe un convenio con ese identificador o codigo."
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

        private async Task<CResult> WriteAsync(int operation, ACA_BEC_CONVENIOTable Data, string user, string station)
        {
            if (Data == null) return new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." };
            try
            {
                var p = new List<CParameter> {
                    new() { ParameterName="@TIPO_ACTUALIZA",Value=operation,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@ID",Value=Data.CORR_CONVENIO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName="@USUARIO",Value=user??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ESTACION",Value=station??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CODIGO_CONVENIO",Value=(object)Data.CODIGO_CONVENIO??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@NOMBRE_CONVENIO",Value=(object)Data.NOMBRE_CONVENIO??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CORR_ENTIDAD_FINANCIADORA",Value=(object)Data.CORR_ENTIDAD_FINANCIADORA??DBNull.Value,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@FECHA_INICIO",Value=(object)Data.FECHA_INICIO??DBNull.Value,DbType=System.Data.DbType.Date },
                    new() { ParameterName="@FECHA_FIN",Value=(object)Data.FECHA_FIN??DBNull.Value,DbType=System.Data.DbType.Date },
                    new() { ParameterName="@DESCRIPCION",Value=(object)Data.DESCRIPCION??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ESTADO_CONVENIO",Value=(object)Data.ESTADO_CONVENIO??DBNull.Value,DbType=System.Data.DbType.AnsiString }
                };
                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_ACA_BEC_CONVENIO", true, p);
                Data.CORR_CONVENIO = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                objData.objConnection.Close();
                if (operation == 3) return new CResult { Result = true, CodeHelper = Data.CORR_CONVENIO, RowsAffected = 1 };
                var result = await GetAsync(new List<CParameter>{
                    new(){ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new(){ParameterName="CORR_CONVENIO",Value=Data.CORR_CONVENIO,DbType=System.Data.DbType.Int32}
                });
                result.CodeHelper = Data.CORR_CONVENIO; result.RowsAffected = result.Data == null ? 0 : 1; return result;
            }
            catch (Exception ex) { return new CResult { ErrorCode = -1, ErrorMessage = ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
    }
}
