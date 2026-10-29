using System;
using System.Collections.Generic;
using System.Data;
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

                reader.Close();
                reader = null;

                if (response != null)
                {
                    // Qué hace: Relee la fila recién insertada directamente desde la vista V_SC_REQUISICION_PERSONAL.
                    // Cómo lo hace: Consulta por CORR_EMPRESA y CORR_REQUISICION_PERSONAL para devolver la entidad completa con los nombres (puesto, modalidad, contratación, unidad) requeridos por la grilla en el SPA sin llamar a GetAll.
                    var pReRead = new List<CParameter>
                    {
                        new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                        new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = response.CORR_REQUISICION_PERSONAL, DbType = System.Data.DbType.Int32 }
                    };
                    reader = await objData.GetDataReader("V_" + _TableName, pReRead);
                    var viewResponse = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).FirstOrDefault();
                    reader.Close();
                    reader = null;

                    if (viewResponse != null)
                    {
                        response = viewResponse;
                    }
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_REQUISICION_PERSONAL ?? 0;
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

                if (response != null)
                {
                    // Qué hace: Relee la fila actualizada directamente desde la vista V_SC_REQUISICION_PERSONAL.
                    // Cómo lo hace: Consulta por CORR_EMPRESA y CORR_REQUISICION_PERSONAL para sincronizar la fila de la grilla con todos los nombres actualizados.
                    var pReRead = new List<CParameter>
                    {
                        new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                        new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = System.Data.DbType.Int32 }
                    };
                    reader = await objData.GetDataReader("V_" + _TableName, pReRead);
                    var viewResponse = new List<SC_REQUISICION_PERSONALView>().FromDataReader(reader).FirstOrDefault();
                    reader.Close();
                    reader = null;

                    if (viewResponse != null)
                    {
                        response = viewResponse;
                    }
                }

                objResultado.Data = response;
                objResultado.Result = true;
                objResultado.RowsAffected = 1;
                objResultado.CodeHelper = response?.CORR_REQUISICION_PERSONAL ?? 0;
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
                // Qué hace: Obtiene la bitácora de firmas ordenada del movimiento más reciente al más antiguo.
                // Cómo lo hace: Lee V_SEG_FLUJO_BITACORA_FIRMAS con orden FECHA_ACCION DESC y CORR_BITACORA DESC.
                var reader = await objData.GetDataReader(System.Data.CommandType.Text, @"
				SELECT
					FB.CORR_EMPRESA,
					FB.CORR_BITACORA,
					FB.CORR_DOCUMENTO AS CORR_REQUISICION_PERSONAL,
					FB.LOGIN_SISTEMA,
					FB.ESTADO_DESTINO,
					FB.COMENTARIO,
					FB.FECHA_ACCION
				FROM V_SEG_FLUJO_BITACORA_FIRMAS FB
				WHERE FB.CORR_TIPO_DOCUMENTO = @CORR_TIPO_DOCUMENTO
				  AND FB.CORR_DOCUMENTO = @CORR_DOCUMENTO
				ORDER BY FB.FECHA_ACCION DESC, FB.CORR_BITACORA DESC", xWhere);

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

        /// <summary>
        /// Puesto del creador de la requisición (USUARIO_CREA). Si no hay creador, usa el login de sesión.
        /// </summary>
        public async Task<int> ResolverUnidadCreadorAsync(int corrEmpresa, int corrRequisicion, string loginFallback)
        {
            var unidad = 0;
            try
            {
                var p = new List<CParameter>
                {
                    new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                    new() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicion, DbType = DbType.Int32 },
                    new() { ParameterName = "LOGIN_FALLBACK", Value = loginFallback ?? string.Empty, DbType = DbType.String },
                };
                var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT TOP 1 EP.CORR_UNIDAD
FROM dbo.GEN_EMPLEADO_PUESTO AS EP
INNER JOIN dbo.GEN_EMPLEADO AS E
	ON E.CORR_EMPRESA = EP.CORR_EMPRESA AND E.CORR_EMPLEADO = EP.CORR_EMPLEADO
INNER JOIN dbo.GEN_PERSONA_USUARIO AS PU
	ON PU.CORR_PERSONA = E.CORR_PERSONA
INNER JOIN dbo.SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES AS UN
	ON UN.CORR_EMPRESA = EP.CORR_EMPRESA AND UN.CORR_UNIDAD = EP.CORR_UNIDAD
WHERE EP.CORR_EMPRESA = @CORR_EMPRESA
  AND LTRIM(RTRIM(PU.LOGIN_SISTEMA)) = LTRIM(RTRIM(ISNULL((
		SELECT R.USUARIO_CREA
		FROM dbo.SC_REQUISICION_PERSONAL AS R
		WHERE R.CORR_EMPRESA = @CORR_EMPRESA
		  AND R.CORR_REQUISICION_PERSONAL = @CORR_REQUISICION_PERSONAL
	), @LOGIN_FALLBACK)))
ORDER BY CASE WHEN UN.ACTIVO = 1 THEN 0 ELSE 1 END, UN.CORR_NIVEL DESC, EP.CORR_UNIDAD DESC", p);
                if (reader.Read() && reader["CORR_UNIDAD"] != DBNull.Value)
                {
                    unidad = Convert.ToInt32(reader["CORR_UNIDAD"]);
                }
                reader.Close();
            }
            finally
            {
                objData.objConnection.Close();
            }

            return unidad;
        }

        /// <summary>
        /// Mapeo flujo → SignalR: lee tipo documento, estado actual y destinatarios pendientes de la instancia.
        /// </summary>
        public async Task<SC_REQUISICION_FLUJO_NOTIF_DTO> GetContextoNotificacionFlujoAsync(
            int corrEmpresa,
            int corrRequisicion)
        {
            var dto = new SC_REQUISICION_FLUJO_NOTIF_DTO
            {
                CORR_REQUISICION_PERSONAL = corrRequisicion,
            };
            try
            {
                var p = new List<CParameter>
                {
                    new() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
                    new() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicion, DbType = DbType.Int32 },
                };

                var reader = await objData.GetDataReader(CommandType.Text, @"
SELECT TOP 1
	R.CORR_REQUISICION_PERSONAL,
	TD.NOMBRE_TIPO,
	E.NOMBRE_ESTADO,
	E.DESCRIPCION AS DESCRIPCION_ESTADO,
	R.USUARIO_CREA AS LOGIN_CREADOR
FROM dbo.SC_REQUISICION_PERSONAL AS R
INNER JOIN dbo.SEG_FLUJO_TIPO_DOCUMENTO AS TD
	ON TD.CORR_EMPRESA = R.CORR_EMPRESA
   AND TD.CODIGO_OPCION = N'SC_REQUISICION'
   AND TD.ACTIVO = 1
LEFT JOIN dbo.SEG_FLUJO_INSTANCIA AS I
	ON I.CORR_EMPRESA = R.CORR_EMPRESA
   AND I.CORR_TIPO_DOCUMENTO = TD.CORR_TIPO_DOCUMENTO
   AND I.CORR_DOCUMENTO = R.CORR_REQUISICION_PERSONAL
   AND I.ACTIVO = 1
LEFT JOIN dbo.SEG_FLUJO_ESTADO AS E
	ON E.CORR_EMPRESA = I.CORR_EMPRESA
   AND E.CORR_ESTADO = I.CORR_ESTADO_ACTUAL
WHERE R.CORR_EMPRESA = @CORR_EMPRESA
  AND R.CORR_REQUISICION_PERSONAL = @CORR_REQUISICION_PERSONAL;", p);

                if (reader.Read())
                {
                    if (reader["CORR_REQUISICION_PERSONAL"] != DBNull.Value)
                    {
                        dto.CORR_REQUISICION_PERSONAL = Convert.ToInt32(reader["CORR_REQUISICION_PERSONAL"]);
                    }
                    dto.NOMBRE_TIPO = reader["NOMBRE_TIPO"]?.ToString()?.Trim();
                    dto.NOMBRE_ESTADO = reader["NOMBRE_ESTADO"]?.ToString()?.Trim();
                    dto.DESCRIPCION_ESTADO = reader["DESCRIPCION_ESTADO"]?.ToString()?.Trim();
                    dto.LOGIN_CREADOR = reader["LOGIN_CREADOR"]?.ToString()?.Trim();
                }
                reader.Close();

                // Solo pendientes del paso actual (evita filas viejas PROCESADO=0 de pasos anteriores).
                var readerDest = await objData.GetDataReader(CommandType.Text, @"
SELECT DISTINCT LTRIM(RTRIM(N.LOGIN_SISTEMA_DESTINO)) AS LOGIN_DESTINO
FROM dbo.SEG_FLUJO_INSTANCIA AS I
INNER JOIN dbo.SEG_FLUJO_TIPO_DOCUMENTO AS TD
	ON TD.CORR_EMPRESA = I.CORR_EMPRESA
   AND TD.CORR_TIPO_DOCUMENTO = I.CORR_TIPO_DOCUMENTO
   AND TD.CODIGO_OPCION = N'SC_REQUISICION'
   AND TD.ACTIVO = 1
INNER JOIN dbo.SEG_FLUJO_NOTIFICACION AS N
	ON N.CORR_EMPRESA = I.CORR_EMPRESA
   AND N.CORR_INSTANCIA = I.CORR_INSTANCIA
   AND N.CORR_PASO = I.CORR_PASO_ACTUAL
WHERE I.CORR_EMPRESA = @CORR_EMPRESA
  AND I.CORR_DOCUMENTO = @CORR_REQUISICION_PERSONAL
  AND I.ACTIVO = 1
  AND ISNULL(N.PROCESADO, 0) = 0
  AND NULLIF(LTRIM(RTRIM(N.LOGIN_SISTEMA_DESTINO)), '') IS NOT NULL;", p);

                while (readerDest.Read())
                {
                    var login = readerDest["LOGIN_DESTINO"]?.ToString()?.Trim();
                    if (!string.IsNullOrWhiteSpace(login)
                        && !dto.LOGINS_PENDIENTES.Exists(x =>
                            string.Equals(x, login, StringComparison.OrdinalIgnoreCase)))
                    {
                        dto.LOGINS_PENDIENTES.Add(login);
                    }
                }
                readerDest.Close();
            }
            finally
            {
                objData.objConnection.Close();
            }

            return dto;
        }
    }
}
