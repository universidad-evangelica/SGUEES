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

        public async Task<CResult> CreateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var reader = await objData.Insert(_TableName, BuildInsertParameters(Data), _CampoPk, BuildCompanyWhere(Data));
                var response = new List<ACA_BEC_TIPOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = 1;
                result.CodeHelper = response?.CORR_BECA ?? 0;
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

        public async Task<CResult> UpdateAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var reader = await objData.Update(_TableName, BuildUpdateParameters(Data), BuildPrimaryWhere(Data));
                var response = new List<ACA_BEC_TIPOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = true;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_BECA ?? Data.CORR_BECA;
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

        public async Task<CResult> DeleteAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                result.RowsAffected = (int)await objData.Delete(_TableName, BuildPrimaryWhere(Data));
                result.Data = null;
                result.Result = true;
                result.CodeHelper = Data.CORR_BECA;
                result.ErrorCode = 0;
                result.ErrorMessage = string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                result.Data = null;
                result.Result = false;
                result.CodeHelper = Data.CORR_BECA;
                result.ErrorCode = -1;
                result.ErrorMessage = "No se puede eliminar el tipo de beca porque tiene registros asociados.";
                result.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

        public async Task<CResult> ActivarInactivarAsync(ACA_BEC_TIPOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_BECA", Value = Data.CORR_BECA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
                };

                var sql = @"
                    BEGIN
                        SET NOCOUNT ON;

                        UPDATE ACA_BEC_TIPO
                        SET ESTADO_BECA = CASE WHEN ESTADO_BECA = 'ACTIVA' THEN 'INACTIVA' ELSE 'ACTIVA' END,
                            USUARIO_ACTU = @USUARIO_ACTU,
                            ESTACION_ACTU = @ESTACION_ACTU,
                            FECHA_ACTU = GETDATE()
                        WHERE CORR_EMPRESA = @CORR_EMPRESA
                            AND CORR_BECA = @CORR_BECA;

                        SELECT *
                        FROM V_ACA_BEC_TIPO
                        WHERE CORR_EMPRESA = @CORR_EMPRESA
                            AND CORR_BECA = @CORR_BECA;
                    END";

                var reader = await objData.GetDataReader(System.Data.CommandType.Text, sql, p);
                var response = new List<ACA_BEC_TIPOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                result.Data = response;
                result.Result = response != null;
                result.RowsAffected = response == null ? 0 : 1;
                result.CodeHelper = response?.CORR_BECA ?? Data.CORR_BECA;
                result.ErrorCode = response == null ? -1 : 0;
                result.ErrorMessage = response == null ? "No se pudo cambiar el estado del tipo de beca." : string.Empty;
                result.ErrorSource = string.Empty;
            }
            catch (Exception e)
            {
                SetError(result, e, Data.CORR_BECA);
            }
            finally
            {
                objData.objConnection.Close();
            }

            return result;
        }

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

        private static List<CParameter> BuildInsertParameters(ACA_BEC_TIPOTable Data)
        {
            var p = BuildUpdateParameters(Data);
            p.Insert(0, new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 });
            p.Insert(1, new CParameter() { ParameterName = "CORR_BECA", Value = Data.CORR_BECA, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput });
            p.Add(new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String });
            p.Add(new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime });
            return p;
        }

        private static List<CParameter> BuildUpdateParameters(ACA_BEC_TIPOTable Data)
        {
            return new List<CParameter>
            {
                new CParameter() { ParameterName = "CODIGO_BECA", Value = Data.CODIGO_BECA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "NOMBRE_BECA", Value = Data.NOMBRE_BECA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "CORR_ORIGEN_BECA", Value = Data.CORR_ORIGEN_BECA, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "CORR_CONVENIO", Value = Data.CORR_CONVENIO, DbType = System.Data.DbType.Int32 },
                new CParameter() { ParameterName = "ARTICULO_REGLAMENTO", Value = Data.ARTICULO_REGLAMENTO, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "PORCENTAJE_COBERTURA_REFERENCIAL", Value = Data.PORCENTAJE_COBERTURA_REFERENCIAL, DbType = System.Data.DbType.Decimal },
                new CParameter() { ParameterName = "CUM_MINIMO_RENOVACION", Value = Data.CUM_MINIMO_RENOVACION, DbType = System.Data.DbType.Decimal },
                new CParameter() { ParameterName = "APLICA_NUEVO_INGRESO", Value = Data.APLICA_NUEVO_INGRESO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "APLICA_ANTIGUO_INGRESO", Value = Data.APLICA_ANTIGUO_INGRESO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "APLICA_EMPLEADO", Value = Data.APLICA_EMPLEADO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "APLICA_HIJO_EMPLEADO", Value = Data.APLICA_HIJO_EMPLEADO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "NIVEL_ACADEMICO_APLICA", Value = Data.NIVEL_ACADEMICO_APLICA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "REQUIERE_CONVENIO", Value = Data.REQUIERE_CONVENIO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "REQUIERE_ESTUDIO_SOCIOECONOMICO", Value = Data.REQUIERE_ESTUDIO_SOCIOECONOMICO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "REQUIERE_APROBACION_COMITE", Value = Data.REQUIERE_APROBACION_COMITE, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "REQUIERE_APROBACION_DIRECTORIO", Value = Data.REQUIERE_APROBACION_DIRECTORIO, DbType = System.Data.DbType.Boolean },
                new CParameter() { ParameterName = "UNIDAD_RESPONSABLE", Value = Data.UNIDAD_RESPONSABLE, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTADO_BECA", Value = Data.ESTADO_BECA, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
            };
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
    }
}
