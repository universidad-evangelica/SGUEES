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
    public class SEG_FLUJO_PASORepository : BaseRepository<SEG_FLUJO_PASOTable>, ISEG_FLUJO_PASORepository
    {
        private const string _TableName = "SEG_FLUJO_PASO";

        public SEG_FLUJO_PASORepository(IConfiguration config) :
                base(config.GetConnectionString("defaultConnection"),
                     config.GetSection("DbProvider:defaultProvider").Value)
        {
        }

        public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_SEG_FLUJO_PASO", xWhere);
                var response = new List<SEG_FLUJO_PASOView>().FromDataReader(reader).ToList();

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
                var reader = await objData.GetDataReader("V_SEG_FLUJO_PASO", xWhere);
                var response = new List<SEG_FLUJO_PASOView>().FromDataReader(reader).FirstOrDefault();

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

        public async Task<CResult> CreateAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pConteo = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                };

                var readerConteo = await objData.GetDataReader("V_SEG_FLUJO_PASO", pConteo);
                var responseConteo = new List<SEG_FLUJO_PASOView>().FromDataReader(readerConteo).ToList();
                readerConteo.Close();
                readerConteo = null;

                var pasosExistentes = responseConteo.Count;
                decimal ordenSiguiente = pasosExistentes + 1;

                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="ORDEN",Value=ordenSiguiente,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="NOMBRE_PASO",Value=Data.NOMBRE_PASO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_ACTOR_ORIGEN",Value=Data.CORR_ACTOR_ORIGEN,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO_ORIGEN",Value=Data.CORR_ESTADO_ORIGEN,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO_ORIGEN_ALT",Value=Data.CORR_ESTADO_ORIGEN_ALT ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO_RETORNO",Value=Data.CORR_PASO_RETORNO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD_DESTINO",Value=Data.CORR_UNIDAD_DESTINO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ACTOR_DESTINO",Value=Data.CORR_ACTOR_DESTINO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PERMITE_AUTO_APROBACION",Value=Data.PERMITE_AUTO_APROBACION,DbType=System.Data.DbType.Boolean},
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

                var reader = await objData.Insert(_TableName, p, "CORR_PASO", pWhere);
                var response = new List<SEG_FLUJO_PASOView>().FromDataReader(reader).FirstOrDefault();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_PASO ?? Data.CORR_PASO;
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

        public async Task<CResult> UpdateAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="ORDEN",Value=Data.ORDEN,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="NOMBRE_PASO",Value=Data.NOMBRE_PASO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_ACTOR_ORIGEN",Value=Data.CORR_ACTOR_ORIGEN,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO_ORIGEN",Value=Data.CORR_ESTADO_ORIGEN,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ESTADO_ORIGEN_ALT",Value=Data.CORR_ESTADO_ORIGEN_ALT ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO_RETORNO",Value=Data.CORR_PASO_RETORNO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD_DESTINO",Value=Data.CORR_UNIDAD_DESTINO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_ACTOR_DESTINO",Value=Data.CORR_ACTOR_DESTINO ?? (object)DBNull.Value,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PERMITE_AUTO_APROBACION",Value=Data.PERMITE_AUTO_APROBACION,DbType=System.Data.DbType.Boolean},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=Data.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SEG_FLUJO_PASOView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_PASO ?? Data.CORR_PASO;
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

        public async Task<CResult> DeleteAsync(SEG_FLUJO_PASOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                // Obtener el paso a eliminar para conocer su flujo real.
                var pPasoActual = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                };

                var readerPasoActual = await objData.GetDataReader("V_SEG_FLUJO_PASO", pPasoActual);
                var pasoActual = new List<SEG_FLUJO_PASOView>().FromDataReader(readerPasoActual).FirstOrDefault();
                readerPasoActual.Close();
                readerPasoActual = null;

                if (pasoActual == null)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "El paso no existe.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                // Regla de negocio: solo se puede eliminar el último paso del flujo.
                var pPasosFlujo = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_FLUJO_PROCESO",Value=pasoActual.CORR_FLUJO_PROCESO,DbType=System.Data.DbType.Int32},
                };

                var readerPasosFlujo = await objData.GetDataReader("V_SEG_FLUJO_PASO", pPasosFlujo);
                var pasosFlujo = new List<SEG_FLUJO_PASOView>().FromDataReader(readerPasosFlujo)
                    .OrderByDescending(p => p.ORDEN)
                    .ThenByDescending(p => p.CORR_PASO)
                    .ToList();
                readerPasosFlujo.Close();
                readerPasosFlujo = null;

                var ultimoPaso = pasosFlujo.FirstOrDefault();
                if (ultimoPaso == null || ultimoPaso.CORR_PASO != Data.CORR_PASO)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "Solo se puede eliminar el último paso del flujo.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                // Verificar si el paso está siendo utilizado en instancias usando la vista
                var pCheck = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO_ACTUAL",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.GetDataReader("V_SEG_FLUJO_INSTANCIA", pCheck);
                var responseInstancias = new List<SEG_FLUJO_INSTANCIAView>().FromDataReader(reader).ToList();
                reader.Close();
                reader = null;

                var count = responseInstancias.Count;
                if (count > 0)
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.CodeHelper = 0;
                    objResultado.ErrorCode = -1;
                    objResultado.ErrorMessage = "No se puede eliminar el paso porque está siendo utilizado en instancias del flujo.";
                    objResultado.ErrorSource = "";
                    return objResultado;
                }

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PASO",Value=Data.CORR_PASO,DbType=System.Data.DbType.Int32},
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_PASO;
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