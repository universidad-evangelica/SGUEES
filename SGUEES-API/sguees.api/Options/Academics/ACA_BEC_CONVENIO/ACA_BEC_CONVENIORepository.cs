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

        public async Task<CResult> CreateAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var reader = await objData.Insert(_TableName, BuildInsertParameters(Data), _CampoPk, BuildCompanyWhere(Data));
                var response = new List<ACA_BEC_CONVENIOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = 1;
                result.CodeHelper = response?.CORR_CONVENIO ?? 0;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetDuplicateAwareError(result, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

        public async Task<CResult> UpdateAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var reader = await objData.Update(_TableName, BuildUpdateParameters(Data), BuildPrimaryWhere(Data));
                var response = new List<ACA_BEC_CONVENIOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_CONVENIO ?? Data.CORR_CONVENIO;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetDuplicateAwareError(result, e);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

        public async Task<CResult> DeleteAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                result.RowsAffected = (int)await objData.Delete(_TableName, BuildPrimaryWhere(Data));
                result.Data = null;
                result.Result = true;
                result.CodeHelper = Data.CORR_CONVENIO;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                result.Data = null;
                result.Result = false;
                result.CodeHelper = Data.CORR_CONVENIO;
                result.ErrorCode = -1;
                result.ErrorMessage = "No se puede eliminar el convenio porque tiene registros asociados.";
                result.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_CONVENIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_CONVENIO", Value = Data.CORR_CONVENIO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
                };

                var sql = @"
                    BEGIN
                        SET NOCOUNT ON;

                        UPDATE ACA_BEC_CONVENIO
                        SET ESTADO_CONVENIO = CASE WHEN ESTADO_CONVENIO = 'VIGENTE' THEN 'CERRADO' ELSE 'VIGENTE' END,
                            USUARIO_ACTU = @USUARIO_ACTU,
                            ESTACION_ACTU = @ESTACION_ACTU,
                            FECHA_ACTU = GETDATE()
                        WHERE CORR_EMPRESA = @CORR_EMPRESA
                            AND CORR_CONVENIO = @CORR_CONVENIO;

                        SELECT *
                        FROM V_ACA_BEC_CONVENIO
                        WHERE CORR_EMPRESA = @CORR_EMPRESA
                            AND CORR_CONVENIO = @CORR_CONVENIO;
                    END";

                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
                var response = new List<ACA_BEC_CONVENIOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = response != null;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_CONVENIO ?? Data.CORR_CONVENIO;
                result.ErrorCode = response == null ? -1 : 0;
                result.ErrorMessage = response == null ? "No se pudo cambiar el estado del convenio." : string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e, Data.CORR_CONVENIO);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

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

        private static List<CParameter> BuildInsertParameters(ACA_BEC_CONVENIOTable Data)
        {
            var p = BuildUpdateParameters(Data);
            p.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
            p.Insert(1, new CParameter() { ParameterName = "CORR_CONVENIO", Value = Data.CORR_CONVENIO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
            p.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
            return p;
        }

        private static List<CParameter> BuildUpdateParameters(ACA_BEC_CONVENIOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CODIGO_CONVENIO", Value = Data.CODIGO_CONVENIO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "NOMBRE_CONVENIO", Value = Data.NOMBRE_CONVENIO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_ENTIDAD_FINANCIADORA", Value = Data.CORR_ENTIDAD_FINANCIADORA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "FECHA_INICIO", Value = Data.FECHA_INICIO, DbType = System.Data.DbType.Date },
                new CParameter() { ParameterName = "FECHA_FIN", Value = Data.FECHA_FIN, DbType = System.Data.DbType.Date },
                new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_CONVENIO", Value = Data.ESTADO_CONVENIO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };
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
    }
}
