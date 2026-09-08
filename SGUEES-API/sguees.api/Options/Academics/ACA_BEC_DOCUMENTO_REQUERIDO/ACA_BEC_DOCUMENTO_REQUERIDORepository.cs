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

        public async Task<CResult> CreateAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var reader = await objData.Insert(_TableName, BuildInsertParameters(Data), _CampoPk, BuildCompanyWhere(Data));
                var response = new List<ACA_BEC_DOCUMENTO_REQUERIDOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = 1;
                result.CodeHelper = response?.CORR_BECA_DOCUMENTO_REQUERIDO ?? 0;
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

        public async Task<CResult> UpdateAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var reader = await objData.Update(_TableName, BuildUpdateParameters(Data), BuildPrimaryWhere(Data));
                var response = new List<ACA_BEC_DOCUMENTO_REQUERIDOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_BECA_DOCUMENTO_REQUERIDO ?? Data.CORR_BECA_DOCUMENTO_REQUERIDO;
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

        public async Task<CResult> DeleteAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                result.RowsAffected = (int)await objData.Delete(_TableName, BuildPrimaryWhere(Data));
                result.Data = null;
                result.Result = true;
                result.CodeHelper = Data.CORR_BECA_DOCUMENTO_REQUERIDO;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                result.Data = null;
                result.Result = false;
                result.CodeHelper = Data.CORR_BECA_DOCUMENTO_REQUERIDO;
                result.ErrorCode = -1;
                result.ErrorMessage = "No se puede eliminar el documento requerido porque tiene registros asociados.";
                result.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_DOCUMENTO_REQUERIDOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_BECA_DOCUMENTO_REQUERIDO, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
                    new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
                };

                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);

                if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value != 0)
                {
                    result.Data = null;
                    result.Result = false;
                    result.RowsAffected = 0;
                    result.CodeHelper = Data.CORR_BECA_DOCUMENTO_REQUERIDO;
                    result.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
                    result.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
                    result.ErrorSource = "C" + _TableName + ".Mtto(" + UpdateType.Update.ToString() + ")";
                    return result;
                }

                var reader = await objData.GetDataReader(_ViewName, BuildPrimaryWhere(Data));
                var response = new List<ACA_BEC_DOCUMENTO_REQUERIDOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = 1;
                result.CodeHelper = response?.CORR_BECA_DOCUMENTO_REQUERIDO ?? Data.CORR_BECA_DOCUMENTO_REQUERIDO;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e, Data.CORR_BECA_DOCUMENTO_REQUERIDO);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

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

        private static List<CParameter> BuildInsertParameters(ACA_BEC_DOCUMENTO_REQUERIDOTable Data)
        {
            var p = BuildUpdateParameters(Data);
            p.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
            p.Insert(1, new CParameter() { ParameterName = "CORR_BECA_DOCUMENTO_REQUERIDO", Value = Data.CORR_BECA_DOCUMENTO_REQUERIDO, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
            p.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
            return p;
        }

        private static List<CParameter> BuildUpdateParameters(ACA_BEC_DOCUMENTO_REQUERIDOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CORR_BECA", Value = Data.CORR_BECA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "NOMBRE_DOCUMENTO", Value = Data.NOMBRE_DOCUMENTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "AREA_RECEPTORA", Value = Data.AREA_RECEPTORA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "OBLIGATORIO", Value = Data.OBLIGATORIO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };
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
    }
}

