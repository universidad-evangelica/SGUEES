using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public class SEG_FLUJO_PROCESORepository : BaseRepository<SEG_FLUJO_PROCESOTable>, ISEG_FLUJO_PROCESORepository
    {
        private const string _TableName = "SEG_FLUJO_PROCESO";

        public SEG_FLUJO_PROCESORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_SEG_FLUJO_PROCESO", xWhere);
                var response = new List<SEG_FLUJO_PROCESOView>().FromDataReader(reader).ToList();

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
                var reader = await objData.GetDataReader("V_SEG_FLUJO_PROCESO", xWhere);
                var response = new List<SEG_FLUJO_PROCESOView>().FromDataReader(reader).FirstOrDefault();

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

        public async Task<CResult> CreateAsync(SEG_FLUJO_PROCESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
                    new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="NOMBRE_FLUJO",Value=Data.NOMBRE_FLUJO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DESCRIPCION",Value=Data.DESCRIPCION ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ES_DEFECTO",Value=Data.ES_DEFECTO,DbType=System.Data.DbType.Boolean},
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

                var reader = await objData.Insert(_TableName, p, "CORR_FLUJO_PROCESO", pWhere);
                var response = new List<SEG_FLUJO_PROCESOView>().FromDataReader(reader).FirstOrDefault();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_FLUJO_PROCESO ?? Data.CORR_FLUJO_PROCESO;
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

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PROCESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_TIPO_DOCUMENTO",Value=Data.CORR_TIPO_DOCUMENTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="NOMBRE_FLUJO",Value=Data.NOMBRE_FLUJO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DESCRIPCION",Value=Data.DESCRIPCION ?? (object)DBNull.Value,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ES_DEFECTO",Value=Data.ES_DEFECTO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SEG_FLUJO_PROCESOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_FLUJO_PROCESO ?? Data.CORR_FLUJO_PROCESO;
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

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PROCESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                // Verificar si el flujo está siendo utilizado en bitácoras usando la vista
                var pCheck = new List<CParameter>
        {
            new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
        };

                var reader = await objData.GetDataReader("V_SEG_FLUJO_BITACORA_FIRMAS", pCheck);
                int count = 0;
                if (reader.Read())
                {
                    count = Convert.ToInt32(reader["COUNT"]);
                }
                reader.Close();
                reader = null;

                if (count > 0)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No se puede eliminar el flujo porque está siendo utilizado en bitácoras del proceso.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                var pWhere = new List<CParameter>
        {
            new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
            new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
        };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_FLUJO_PROCESO;
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