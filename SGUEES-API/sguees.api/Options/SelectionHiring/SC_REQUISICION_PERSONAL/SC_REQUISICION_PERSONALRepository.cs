using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using SGUEES.Models;


namespace SGUEES.Repositories
{
    public class SC_REQUISICION_PERSONALRepository : BaseRepository<SC_REQUISICION_PERSONALTable>, ISC_REQUISICION_PERSONALRepository
    {
        private const string _TableName = "SC_REQUISICION_PERSONAL";
        private const string _TableNameBitacora = "SEG_FLUJO_BITACORA";

        private static object ToSqlDateTime(DateTime? fecha)
        {
            if (!fecha.HasValue || fecha.Value.Year < 1753)
            {
                return DBNull.Value;
            }

            return fecha.Value;
        }

        public SC_REQUISICION_PERSONALRepository(IConfiguration config) : 
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
                var response = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).ToList();

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
                var response = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).FirstOrDefault();

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

        public async Task<CResult> CreateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value=Data.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
                    new CParameter() {ParameterName="CORR_DESCRIPTOR_PUESTO",Value=Data.CORR_DESCRIPTOR_PUESTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD",Value=Data.CORR_UNIDAD,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PUESTO",Value=Data.CORR_PUESTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_MODALIDAD",Value=Data.CORR_TIPO_MODALIDAD,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_VACANTE",Value=Data.CORR_TIPO_VACANTE,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CANTIDAD_PLAZAS",Value=Data.CANTIDAD_PLAZAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PLAZAS_CUBIERTAS",Value=Data.PLAZAS_CUBIERTAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="FECHA_REQUISICION",Value=Data.FECHA_REQUISICION,DbType=System.Data.DbType.Date},
                    new CParameter() {ParameterName="JUSTIFICACION",Value=Data.JUSTIFICACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_EMPLEADO_SUSTITUTO",Value=Data.CORR_EMPLEADO_SUSTITUTO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="SALARIO",Value=Data.SALARIO,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="CORR_ESTADO_REQUISICION",Value=Data.CORR_ESTADO_REQUISICION,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="FECHA_APROBACION",Value=ToSqlDateTime(Data.FECHA_APROBACION),DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="FECHA_CIERRE",Value=ToSqlDateTime(Data.FECHA_CIERRE),DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="TIEMPO_CONTRATO",Value=Data.TIEMPO_CONTRATO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="HORARIO",Value=Data.HORARIO,DbType=System.Data.DbType.String},
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

                var reader = await objData.Insert(_TableName, p, "CORR_REQUISICION_PERSONAL", pWhere);
                var response = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).FirstOrDefault();

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response.CORR_REQUISICION_PERSONAL;
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

        public async Task<CResult> UpdateAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_DESCRIPTOR_PUESTO",Value=Data.CORR_DESCRIPTOR_PUESTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_UNIDAD",Value=Data.CORR_UNIDAD,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PUESTO",Value=Data.CORR_PUESTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_MODALIDAD",Value=Data.CORR_TIPO_MODALIDAD,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_VACANTE",Value=Data.CORR_TIPO_VACANTE,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CANTIDAD_PLAZAS",Value=Data.CANTIDAD_PLAZAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PLAZAS_CUBIERTAS",Value=Data.PLAZAS_CUBIERTAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="FECHA_REQUISICION",Value=Data.FECHA_REQUISICION,DbType=System.Data.DbType.Date},
                    new CParameter() {ParameterName="JUSTIFICACION",Value=Data.JUSTIFICACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_EMPLEADO_SUSTITUTO",Value=Data.CORR_EMPLEADO_SUSTITUTO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="SALARIO",Value=Data.SALARIO,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="CORR_ESTADO_REQUISICION",Value=Data.CORR_ESTADO_REQUISICION,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="FECHA_APROBACION",Value=ToSqlDateTime(Data.FECHA_APROBACION),DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="FECHA_CIERRE",Value=ToSqlDateTime(Data.FECHA_CIERRE),DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="TIEMPO_CONTRATO",Value=Data.TIEMPO_CONTRATO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="HORARIO",Value=Data.HORARIO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
                };

                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value=Data.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
                };

                var reader = await objData.Update(_TableName, p, pWhere);
                var response = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).FirstOrDefault();

                reader.Close();
                reader = null;

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response.CORR_REQUISICION_PERSONAL;
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

        public async Task<CResult> DeleteAsync(SC_REQUISICION_PERSONALTable Data, string vLOGIN_SISTEMA, string vESTACION)
        {
            CResult objResultado = new();

            try
            {
                var pWhere = new List<CParameter>
                {
                    new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_REQUISICION_PERSONAL",Value=Data.CORR_REQUISICION_PERSONAL,DbType=System.Data.DbType.Int32},
                };

                objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
                objResultado.Data = null;
                objResultado.Result = true;
                objResultado.CodeHelper = Data.CORR_REQUISICION_PERSONAL;
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

        //public async Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(List<CParameter> xWhere)
        //{
        //    CResult objResultado = new();

        //    try
        //    {
        //        var reader = await objData.GetDataReader("V_" + _TableNameBitacora, xWhere);
        //        var response = new List<SC_REQUISICION_PERSONAL_BITACORAView>().FromDataReader(reader).ToList();

        //        reader.Close();
        //        reader = null;

        //        objResultado.Data = response;
        //        objResultado.Result = true;
        //        objResultado.RowsAffected = response.Count;
        //        objResultado.CodeHelper = 0;
        //        objResultado.ErrorCode = 0;
        //        objResultado.ErrorMessage = "";
        //        objResultado.ErrorSource = "";
        //    }
        //    catch (System.Exception e)
        //    {
        //        objResultado.Data = null;
        //        objResultado.Result = false;
        //        objResultado.CodeHelper = 0;
        //        objResultado.ErrorCode = -1;
        //        objResultado.ErrorMessage = e.Message;
        //        objResultado.ErrorSource += $"[{e.Source}]";
        //    }
        //    finally
        //    {
        //        objData.objConnection.Close();
        //    }

        //    return objResultado;
        //}

        /// <summary>
        /// Lectura de vista V_SEG_FLUJO_BITACORA_FIRMAS
        /// Devuelve todo el movimiento de la requisicion personal
        /// </summary>
        public async Task<CResult> GetAllAsyncBitacoraByCORR_REQUISICION(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, @"
				SELECT FB.* 
				FROM V_SEG_FLUJO_BITACORA_FIRMAS FB
				WHERE CORR_TIPO_DOCUMENTO = @CORR_TIPO_DOCUMENTO AND CORR_DOCUMENTO = @CORR_DOCUMENTO", xWhere);

                var response = new List<SC_REQUISICION_PERSONAL_BITACORAView>().FromDataReader(reader).ToList();

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

        /// <summary>
        /// Lee los candidatos activos en proceso de selección de una requisición.
        /// Los filtros de estado y actividad pertenecen a la vista SQL.
        /// </summary>
        public async Task<CResult> GetAllAsyncCandidatosByCORR_REQUISICION(List<CParameter> xWhere)
        {
            CResult objResultado = new();

            try
            {
                var reader = await objData.GetDataReader("V_SC_REQUISICION_PERSONAL_CANDIDATO", xWhere);
                var response = new List<SC_REQUISICION_PERSONAL_CANDIDATOView>()
                    .FromDataReader(reader)
                    .OrderBy(x => x.NOMBRE_PERSONA)
                    .ToList();

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
            catch (Exception e)
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

        /// <summary>
        /// Ejecuta PRAL_MTTO_SC_REQUISICION_PERSONAL_AUTORIZA y relee V_SC_REQUISICION_PERSONAL.
        /// </summary>
        public async Task<CResult> AutorizaAsync(SC_REQUISICION_PERSONAL_AUTORIZAParam Data, string vLOGIN_SISTEMA)
        {
            CResult objResultado = new();
            const string spName = "PRAL_MTTO_SC_REQUISICION_PERSONAL_AUTORIZA";

            try
            {
                var p = new List<CParameter>
                {
                    new CParameter() { ParameterName = "@CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "@CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = System.Data.DbType.Int32 },
                    new CParameter()
                    {
                        ParameterName = "@CORR_UNIDAD_DOCUMENTO",
                        Value = Data.CORR_UNIDAD_DOCUMENTO.HasValue && Data.CORR_UNIDAD_DOCUMENTO.Value > 0
                            ? Data.CORR_UNIDAD_DOCUMENTO.Value
                            : (object)DBNull.Value,
                        DbType = System.Data.DbType.Int32,
                    },
                    new CParameter() { ParameterName = "@OPERACION", Value = Data.OPERACION, DbType = System.Data.DbType.Int32 },
                    new CParameter()
                    {
                        ParameterName = "@CORR_ACCION",
                        Value = Data.CORR_ACCION.HasValue && Data.CORR_ACCION.Value > 0
                            ? Data.CORR_ACCION.Value
                            : (object)DBNull.Value,
                        DbType = System.Data.DbType.Int32,
                    },
                    new CParameter() { ParameterName = "@LOGIN_SISTEMA", Value = vLOGIN_SISTEMA ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@OBSERVACION", Value = Data.OBSERVACION ?? string.Empty, DbType = System.Data.DbType.String },
                    new CParameter() { ParameterName = "@CORR_ESTADO", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 500 },
                    new CParameter() { ParameterName = "@CORR_ACCION_USADA", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@CORR_PASO_ACTUAL", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                    new CParameter() { ParameterName = "@MODO", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 20 },
                    new CParameter() { ParameterName = "@NOMBRE_ESTADO", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.Output, Size = 100 },
                    new CParameter() { ParameterName = "@CORR_ESTADO_REQUISICION", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.Output },
                };

                await objData.ExecCmd(System.Data.CommandType.StoredProcedure, spName, true, p);

                var mensajeError = objData.objCommand.Parameters["@MENSAJE_ERROR"].Value?.ToString();
                if (!string.IsNullOrWhiteSpace(mensajeError))
                {
                    objResultado.Data = null;
                    objResultado.Result = false;
                    objResultado.RowsAffected = 0;
                    objResultado.CodeHelper = Data.CORR_REQUISICION_PERSONAL;
                    objResultado.ErrorCode = -10;
                    objResultado.ErrorMessage = mensajeError;
                    objResultado.ErrorSource = "C" + _TableName + ".Autoriza";
                    return objResultado;
                }

                var keyWhere = new List<CParameter>
                {
                    new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                    new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = System.Data.DbType.Int32 },
                };

                var readerGet = await objData.GetDataReader("V_" + _TableName, keyWhere);
                var response = new List<SC_REQUISICION_PERSONALView>().FromDataReader(readerGet).FirstOrDefault();
                readerGet.Close();

                objResultado.Data = response;
                objResultado.Result = response != null;
                objResultado.RowsAffected = response == null ? 0 : 1;
                objResultado.CodeHelper = Data.CORR_REQUISICION_PERSONAL;
                objResultado.ErrorCode = response == null ? -1 : 0;
                objResultado.ErrorMessage = response == null
                    ? "La operacion de flujo se ejecuto pero no se pudo releer la requisicion."
                    : string.Empty;
                objResultado.ErrorSource = string.Empty;
            }
            catch (Exception e)
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
