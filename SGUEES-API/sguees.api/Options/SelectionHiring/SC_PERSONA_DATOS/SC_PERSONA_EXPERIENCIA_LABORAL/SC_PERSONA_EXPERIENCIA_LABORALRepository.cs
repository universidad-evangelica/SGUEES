using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
namespace sguees.Repositories
{
    public class SC_PERSONA_EXPERIENCIA_LABORALRepository : BaseRepository<SC_PERSONA_EXPERIENCIA_LABORALTable>, ISC_PERSONA_EXPERIENCIA_LABORALRepository
    {
        private const string _TableName = "SC_PERSONA_EXPERIENCIA_LABORAL";
        public SC_PERSONA_EXPERIENCIA_LABORALRepository(IConfiguration config) : base(config.GetConnectionString("defaultConnection"), config.GetSection("DbProvider:defaultProvider").Value) { }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try { var reader = await objData.GetDataReader("V_" + _TableName, xWhere); var data = new List<SC_PERSONA_EXPERIENCIA_LABORALView>().FromDataReader(reader).ToList(); reader.Close(); result.Data = data; result.Result = true; result.RowsAffected = data.Count; }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try { var reader = await objData.GetDataReader("V_" + _TableName, xWhere); var data = new List<SC_PERSONA_EXPERIENCIA_LABORALView>().FromDataReader(reader).FirstOrDefault(); reader.Close(); result.Data = data; result.Result = true; result.RowsAffected = data == null ? 0 : 1; }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> CreateAsync(SC_PERSONA_EXPERIENCIA_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try
            {
                var p = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_EXPERIENCIA_LABORAL", Value = Data.CORR_EXPERIENCIA_LABORAL, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "EMPRESA", Value = Data.EMPRESA, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "TELEFONO", Value = Data.TELEFONO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "CARGO", Value = Data.CARGO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "JEFE_INMEDIATO", Value = Data.JEFE_INMEDIATO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "FECHA_INICIO", Value = Data.FECHA_INICIO, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "FECHA_FIN", Value = Data.FECHA_FIN, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "SALARIO_INICIAL", Value = Data.SALARIO_INICIAL, DbType = System.Data.DbType.Decimal },
                    new CParameter { ParameterName = "SALARIO_FINAL", Value = Data.SALARIO_FINAL, DbType = System.Data.DbType.Decimal },
                    new CParameter { ParameterName = "MOTIVO_SALIDA", Value = Data.MOTIVO_SALIDA, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime }
                };
                var pWhere = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 }
                };
                var reader = await objData.Insert(_TableName, p, "CORR_EXPERIENCIA_LABORAL", pWhere); var data = new List<SC_PERSONA_EXPERIENCIA_LABORALView>().FromDataReader(reader).FirstOrDefault(); reader.Close();
                result.Data = data; result.Result = true; result.RowsAffected = data == null ? 0 : 1; result.CodeHelper = data?.CORR_EXPERIENCIA_LABORAL ?? 0;
            }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> UpdateAsync(SC_PERSONA_EXPERIENCIA_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try
            {
                var p = new List<CParameter> {
                    new CParameter { ParameterName = "EMPRESA", Value = Data.EMPRESA, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "TELEFONO", Value = Data.TELEFONO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "CARGO", Value = Data.CARGO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "JEFE_INMEDIATO", Value = Data.JEFE_INMEDIATO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "FECHA_INICIO", Value = Data.FECHA_INICIO, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "FECHA_FIN", Value = Data.FECHA_FIN, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "SALARIO_INICIAL", Value = Data.SALARIO_INICIAL, DbType = System.Data.DbType.Decimal },
                    new CParameter { ParameterName = "SALARIO_FINAL", Value = Data.SALARIO_FINAL, DbType = System.Data.DbType.Decimal },
                    new CParameter { ParameterName = "MOTIVO_SALIDA", Value = Data.MOTIVO_SALIDA, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime }
                };
                var pWhere = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_EXPERIENCIA_LABORAL", Value = Data.CORR_EXPERIENCIA_LABORAL, DbType = System.Data.DbType.Int32 }
                };
                var reader = await objData.Update(_TableName, p, pWhere); var data = new List<SC_PERSONA_EXPERIENCIA_LABORALView>().FromDataReader(reader).FirstOrDefault(); reader.Close();
                result.Data = data; result.Result = true; result.RowsAffected = data == null ? 0 : 1; result.CodeHelper = data?.CORR_EXPERIENCIA_LABORAL ?? 0;
            }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> DeleteAsync(SC_PERSONA_EXPERIENCIA_LABORALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try { var pWhere = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_EXPERIENCIA_LABORAL", Value = Data.CORR_EXPERIENCIA_LABORAL, DbType = System.Data.DbType.Int32 }
                }; result.RowsAffected = (int)await objData.Delete(_TableName, pWhere); result.Result = true; result.CodeHelper = Data.CORR_EXPERIENCIA_LABORAL; }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        private static void SetError(CResult result, System.Exception ex) { result.Data = null; result.Result = false; result.ErrorCode = -1; result.ErrorMessage = ex.Message; result.ErrorSource = $"[{ex.Source}]"; }
    }
}
