using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public class SEG_FLUJO_ESTADORepository : BaseRepository<SEG_FLUJO_ESTADOTable>, ISEG_FLUJO_ESTADORepository
    {
        private const string _TableName = "SEG_FLUJO_ESTADO";

        public SEG_FLUJO_ESTADORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_SEG_FLUJO_ESTADO", xWhere);
                var response = new List<SEG_FLUJO_ESTADOView>().FromDataReader(reader).ToList();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = response.Count;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
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
                var reader = await objData.GetDataReader("V_SEG_FLUJO_ESTADO", xWhere);
                var response = new List<SEG_FLUJO_ESTADOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> CreateAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO",Value=Data.CORR_ESTADO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
                    new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="NOMBRE_ESTADO",Value=Data.NOMBRE_ESTADO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DESCRIPCION",Value=Data.DESCRIPCION ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ES_INICIAL",Value=Data.ES_INICIAL,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="ES_FINAL",Value=Data.ES_FINAL,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="USUARIO_CREA",Value=Data.USUARIO_CREA,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_CREA",Value=Data.ESTACION_CREA,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_CREA",Value=Data.FECHA_CREA,DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Insert(_TableName, p, "CORR_ESTADO", pWhere);
                var response = new List<SEG_FLUJO_ESTADOView>().FromDataReader(reader).FirstOrDefault();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_ESTADO ?? Data.CORR_ESTADO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> UpdateAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="NOMBRE_ESTADO",Value=Data.NOMBRE_ESTADO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DESCRIPCION",Value=Data.DESCRIPCION ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ES_INICIAL",Value=Data.ES_INICIAL,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="ES_FINAL",Value=Data.ES_FINAL,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO",Value=Data.CORR_ESTADO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SEG_FLUJO_ESTADOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_ESTADO ?? Data.CORR_ESTADO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }

        public async Task<CResult> DeleteAsync(SEG_FLUJO_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                // Verificar si el estado está siendo utilizado
                // Primero obtenemos el registro con el campo EN_USO
                var pCheck = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO",Value=Data.CORR_ESTADO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.GetDataReader("V_SEG_FLUJO_ESTADO", pCheck);
                int enUso = 0;
                if (reader.Read())
                {
                    enUso = Convert.ToInt32(reader["EN_USO"]);
                }
                reader.Close();
                reader = null;

                if (enUso > 0)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No se puede eliminar el estado porque está siendo utilizado en pasos del flujo.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                // Si no está siendo utilizado, proceder con la eliminación
                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO",Value=Data.CORR_ESTADO,DbType=System.Data.DbType.Int32},
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_ESTADO;
                objResultado.ErrorCode = 0;
                objResultado.ErrorMessage = "";
                objResultado.ErrorSource = "";
            }
            catch (System.Exception e)
            {
                objResultado.Data = null;
                objResultado.Result = false;
                objResultado.CodeHelper = 0;
                objResultado.ErrorCode = -1;
                objResultado.ErrorMessage = e.Message;
                objResultado.ErrorSource += $"[{e.Source}]";
            }
            finally
            {
                objData.objConnection.Close();
            }

            return objResultado;
        }
    }
}