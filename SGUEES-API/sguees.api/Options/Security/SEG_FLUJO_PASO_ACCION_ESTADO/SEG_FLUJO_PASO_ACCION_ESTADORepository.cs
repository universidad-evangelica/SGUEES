using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
    public class SEG_FLUJO_PASO_ACCION_ESTADORepository : BaseRepository<SEG_FLUJO_PASO_ACCION_ESTADOTable>, ISEG_FLUJO_PASO_ACCION_ESTADORepository
    {
        private const string _TableName = "SEG_FLUJO_PASO_ACCION_ESTADO";

        public SEG_FLUJO_PASO_ACCION_ESTADORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
                var response = new List<SEG_FLUJO_PASO_ACCION_ESTADOView>().FromDataReader(reader).ToList();
                response = response
                .OrderBy(x => x.CORR_ACCION)
                 .ToList();
                reader.Close();
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
                var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
                var response = new List<SEG_FLUJO_PASO_ACCION_ESTADOView>().FromDataReader(reader).FirstOrDefault();

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

        public async Task<CResult> CreateAsync(SEG_FLUJO_PASO_ACCION_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pConteo = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                };

                var readerConteo = await objData.GetDataReader("V_" + _TableName, pConteo);
                var responseConteo = new List<SEG_FLUJO_PASO_ACCION_ESTADOView>().FromDataReader(readerConteo).ToList();
                readerConteo.Close();
                readerConteo = null;

                int corrAccionSiguiente = responseConteo.Count + 1;

                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ACCION",Value=corrAccionSiguiente,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO_DESTINO",Value=Data.CORR_ESTADO_DESTINO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PERMITIDO",Value=Data.PERMITIDO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=Data.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Byte},
                    new CParameter() {ParameterName="CORR_TIPO_NOTIFICACION",Value=Data.CORR_TIPO_NOTIFICACION,DbType=System.Data.DbType.Byte},
                    new CParameter() {ParameterName="CORR_PASO_DESTINO",Value=Data.CORR_PASO_DESTINO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
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
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ACCION",Value=corrAccionSiguiente,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Insert(_TableName, p, "", pWhere);
                var response = new List<SEG_FLUJO_PASO_ACCION_ESTADOView>().FromDataReader(reader).FirstOrDefault();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = corrAccionSiguiente;
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

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PASO_ACCION_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_ESTADO_DESTINO",Value=Data.CORR_ESTADO_DESTINO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PERMITIDO",Value=Data.PERMITIDO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="CORR_TIPO_MOVIMIENTO",Value=Data.CORR_TIPO_MOVIMIENTO,DbType=System.Data.DbType.Byte},
                    new CParameter() {ParameterName="CORR_TIPO_NOTIFICACION",Value=Data.CORR_TIPO_NOTIFICACION,DbType=System.Data.DbType.Byte},
                    new CParameter() {ParameterName="CORR_PASO_DESTINO",Value=Data.CORR_PASO_DESTINO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ACCION",Value=Data.CORR_ACCION,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SEG_FLUJO_PASO_ACCION_ESTADOView>().FromDataReader(reader).FirstOrDefault();

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

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PASO_ACCION_ESTADOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pAccionesPaso = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                };

                var readerAccionesPaso = await objData.GetDataReader("V_" + _TableName, pAccionesPaso);
                var accionesPaso = new List<SEG_FLUJO_PASO_ACCION_ESTADOView>().FromDataReader(readerAccionesPaso)
                    .OrderByDescending(a => a.CORR_ACCION)
                    .ToList();
                readerAccionesPaso.Close();
                readerAccionesPaso = null;

                var ultimaAccion = accionesPaso.FirstOrDefault();
                if (ultimaAccion == null)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No existen acciones para el paso indicado.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                if (Data.CORR_ACCION != ultimaAccion.CORR_ACCION)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "Solo se puede eliminar la última acción del paso.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ACCION",Value=Data.CORR_ACCION,DbType=System.Data.DbType.Int32},
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
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
    }
}