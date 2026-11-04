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
    public class ACA_BEC_TIPORepository : BaseRepository<ACA_BEC_TIPOTable>, IACA_BEC_TIPORepository
    {
        private const string _TableName = "ACA_BEC_TIPO";
        private const string _ViewName = "V_ACA_BEC_TIPO";
        private const string _CampoPk = "CORR_BECA";

        public ACA_BEC_TIPORepository(IConfiguration config) :
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
                        x.ParameterName == "CORR_BECA" ||
                        x.ParameterName == "CODIGO_BECA" ||
                        x.ParameterName == "NOMBRE_BECA" ||
                        x.ParameterName == "CORR_ORIGEN_BECA" ||
                        x.ParameterName == "CORR_CONVENIO" ||
                        x.ParameterName == "ESTADO_BECA")
                    .ToList();

                var reader = await objData.GetDataReader(_ViewName, dbWhere);
                var response = new List<ACA_BEC_TIPOView>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_BECA)
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
                var response = new List<ACA_BEC_TIPOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_BECA ?? 0;
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

        public Task<CResult> CreateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(1, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> UpdateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(2, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> DeleteAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(3, Data, vLOGIN_SISTEMA, vESTACION);

        public Task<CResult> ActivarInactivarAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
            => WriteAsync(4, Data, vLOGIN_SISTEMA, vESTACION);

        public async Task<CResult> GetOrigenesAsync(int corrEmpresa)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ACTIVO", Value = true, DbType = System.Data.DbType.Boolean },
                };
                var reader = await objData.GetDataReader("V_ACA_BEC_ORIGEN_BECA", p);
                var response = new List<ACA_BEC_ORIGEN_BECALookup>().FromDataReader(reader)
                    .OrderBy(x => x.CORR_ORIGEN_BECA)
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

        public async Task<CResult> GetConveniosAsync(int corrEmpresa)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ESTADO_CONVENIO", Value = "VIGENTE", DbType = System.Data.DbType.String },
                };
                var reader = await objData.GetDataReader("V_ACA_BEC_CONVENIO", p);
                var response = new List<ACA_BEC_CONVENIOLookup>().FromDataReader(reader)
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

        public async Task<bool> ConvenioEstaVigenteAsync(int corrEmpresa, int corrConvenio)
        {
            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_CONVENIO", Value = corrConvenio, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "ESTADO_CONVENIO", Value = "VIGENTE", DbType = System.Data.DbType.String },
                };

                var reader = await objData.GetDataReader("V_ACA_BEC_CONVENIO", p);
                var response = new List<ACA_BEC_CONVENIOLookup>().FromDataReader(reader).FirstOrDefault();
                reader.Close();
                return response != null;
            }
            finally
            {
                objData.objConnection.Close();
            }
        }





        private static List<CParameter> BuildCompanyWhere(ACA_BEC_TIPOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static List<CParameter> BuildPrimaryWhere(ACA_BEC_TIPOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_BECA", Value = Data.CORR_BECA, DbType = System.Data.DbType.Int32 },
            };
        }

        private static void SetDuplicateAwareError(CResult result, Exception e)
        {
            SetError(result, e, 0, IsDuplicateKeyError(e)
                ? "Ya existe un tipo de beca con ese codigo. Seleccione otro codigo para continuar."
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

        private async Task<CResult> WriteAsync(int operation, ACA_BEC_TIPOTable Data, string user, string station)
        {
            if (Data == null) return new CResult { ErrorCode = 51000, ErrorMessage = "No se recibieron datos." };
            try
            {
                var p = new List<CParameter> {
                    new() { ParameterName="@TIPO_ACTUALIZA",Value=operation,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@ID",Value=Data.CORR_BECA,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput },
                    new() { ParameterName="@USUARIO",Value=user??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ESTACION",Value=station??"",DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CODIGO_BECA",Value=(object)Data.CODIGO_BECA??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@NOMBRE_BECA",Value=(object)Data.NOMBRE_BECA??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CORR_ORIGEN_BECA",Value=(object)Data.CORR_ORIGEN_BECA??DBNull.Value,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@CORR_CONVENIO",Value=(object)Data.CORR_CONVENIO??DBNull.Value,DbType=System.Data.DbType.Int32 },
                    new() { ParameterName="@ARTICULO_REGLAMENTO",Value=(object)Data.ARTICULO_REGLAMENTO??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@PORCENTAJE_COBERTURA_REFERENCIAL",Value=(object)Data.PORCENTAJE_COBERTURA_REFERENCIAL??DBNull.Value,DbType=System.Data.DbType.Decimal },
                    new() { ParameterName="@REQUIERE_CONVENIO",Value=(object)Data.REQUIERE_CONVENIO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@REQUIERE_ESTUDIO_SOCIOECONOMICO",Value=(object)Data.REQUIERE_ESTUDIO_SOCIOECONOMICO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@REQUIERE_APROBACION_COMITE",Value=(object)Data.REQUIERE_APROBACION_COMITE??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@REQUIERE_APROBACION_DIRECTORIO",Value=(object)Data.REQUIERE_APROBACION_DIRECTORIO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@UNIDAD_RESPONSABLE",Value=(object)Data.UNIDAD_RESPONSABLE??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@DESCRIPCION",Value=(object)Data.DESCRIPCION??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@ESTADO_BECA",Value=(object)Data.ESTADO_BECA??DBNull.Value,DbType=System.Data.DbType.AnsiString },
                    new() { ParameterName="@CUM_MINIMO_RENOVACION",Value=(object)Data.CUM_MINIMO_RENOVACION??DBNull.Value,DbType=System.Data.DbType.Decimal },
                    new() { ParameterName="@APLICA_NUEVO_INGRESO",Value=(object)Data.APLICA_NUEVO_INGRESO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@APLICA_ANTIGUO_INGRESO",Value=(object)Data.APLICA_ANTIGUO_INGRESO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@APLICA_EMPLEADO",Value=(object)Data.APLICA_EMPLEADO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@APLICA_HIJO_EMPLEADO",Value=(object)Data.APLICA_HIJO_EMPLEADO??DBNull.Value,DbType=System.Data.DbType.Boolean },
                    new() { ParameterName="@NIVEL_ACADEMICO_APLICA",Value=(object)Data.NIVEL_ACADEMICO_APLICA??DBNull.Value,DbType=System.Data.DbType.AnsiString }
                };
                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_ACA_BEC_TIPO", true, p);
                Data.CORR_BECA = Convert.ToInt32(objData.objCommand.Parameters["@ID"].Value);
                objData.objConnection.Close();
                if (operation == 3) return new CResult { Result = true, CodeHelper = Data.CORR_BECA, RowsAffected = 1 };
                var result = await GetAsync(new List<CParameter>{
                    new(){ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new(){ParameterName="CORR_BECA",Value=Data.CORR_BECA,DbType=System.Data.DbType.Int32}
                });
                result.CodeHelper = Data.CORR_BECA; result.RowsAffected = result.Data == null ? 0 : 1; return result;
            }
            catch (Exception ex) { return new CResult { ErrorCode = -1, ErrorMessage = ex.Message }; }
            finally { objData.objConnection.Close(); }
        }
    }
}
