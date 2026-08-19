using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
namespace sguees.Repositories
{
    public class SC_PERSONA_ESTUDIORepository : BaseRepository<SC_PERSONA_ESTUDIOTable>, ISC_PERSONA_ESTUDIORepository
    {
        private const string _TableName = "SC_PERSONA_ESTUDIO";
        public SC_PERSONA_ESTUDIORepository(IConfiguration config) : base(config.GetConnectionString("defaultConnection"), config.GetSection("DbProvider:defaultProvider").Value) { }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try { var reader = await objData.GetDataReader("V_" + _TableName, xWhere); var data = new List<SC_PERSONA_ESTUDIOView>().FromDataReader(reader).ToList(); reader.Close(); result.Data = data; result.Result = true; result.RowsAffected = data.Count; }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> GetAsync(List<CParameter> xWhere)
        {
            CResult result = new();
            try { var reader = await objData.GetDataReader("V_" + _TableName, xWhere); var data = new List<SC_PERSONA_ESTUDIOView>().FromDataReader(reader).FirstOrDefault(); reader.Close(); result.Data = data; result.Result = true; result.RowsAffected = data == null ? 0 : 1; }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> CreateAsync(SC_PERSONA_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try
            {
                var p = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_ESTUDIO", Value = Data.CORR_ESTUDIO, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "INSTITUCION", Value = Data.INSTITUCION, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "DESDE", Value = Data.DESDE, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "HASTA", Value = Data.HASTA, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "TITULO", Value = Data.TITULO, DbType = System.Data.DbType.String },
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
                var reader = await objData.Insert(_TableName, p, "CORR_ESTUDIO", pWhere); var data = new List<SC_PERSONA_ESTUDIOView>().FromDataReader(reader).FirstOrDefault(); reader.Close();
                result.Data = data; result.Result = true; result.RowsAffected = data == null ? 0 : 1; result.CodeHelper = data?.CORR_ESTUDIO ?? 0;
            }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> UpdateAsync(SC_PERSONA_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try
            {
                var p = new List<CParameter> {
                    new CParameter { ParameterName = "NIVEL", Value = Data.NIVEL, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "INSTITUCION", Value = Data.INSTITUCION, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "DESDE", Value = Data.DESDE, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "HASTA", Value = Data.HASTA, DbType = System.Data.DbType.DateTime },
                    new CParameter { ParameterName = "TITULO", Value = Data.TITULO, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
                    new CParameter { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime }
                };
                var pWhere = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_ESTUDIO", Value = Data.CORR_ESTUDIO, DbType = System.Data.DbType.Int32 }
                };
                var reader = await objData.Update(_TableName, p, pWhere); var data = new List<SC_PERSONA_ESTUDIOView>().FromDataReader(reader).FirstOrDefault(); reader.Close();
                result.Data = data; result.Result = true; result.RowsAffected = data == null ? 0 : 1; result.CodeHelper = data?.CORR_ESTUDIO ?? 0;
            }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        public async Task<CResult> DeleteAsync(SC_PERSONA_ESTUDIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult result = new();
            try { var pWhere = new List<CParameter> {
                    new CParameter { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_PERSONA_DATOS", Value = Data.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
                    new CParameter { ParameterName = "CORR_ESTUDIO", Value = Data.CORR_ESTUDIO, DbType = System.Data.DbType.Int32 }
                }; result.RowsAffected = (int)await objData.Delete(_TableName, pWhere); result.Result = true; result.CodeHelper = Data.CORR_ESTUDIO; }
            catch (System.Exception ex) { SetError(result, ex); }
            finally { objData.objConnection.Close(); }
            return result;
        }
        private static void SetError(CResult result, System.Exception ex) { result.Data = null; result.Result = false; result.ErrorCode = -1; result.ErrorMessage = ex.Message; result.ErrorSource = $"[{ex.Source}]"; }
    }
}
