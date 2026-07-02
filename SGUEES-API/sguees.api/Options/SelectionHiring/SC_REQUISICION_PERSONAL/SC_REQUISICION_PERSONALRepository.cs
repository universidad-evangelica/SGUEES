using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Linq;
using System;
using eFramework.Data;
using SGUEES.Models;
using eFramework.Core;


namespace SGUEES.Repositories
{
    public class SC_REQUISICION_PERSONALRepository : BaseRepository<SC_REQUISICION_PERSONALTable>, ISC_REQUISICION_PERSONALRepository
    {
        private const string _TableName = "SC_REQUISICION_PERSONAL";

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
                    new CParameter() {ParameterName="CORR_DESCRIPTOR",Value=Data.CORR_DESCRIPTOR,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_DEPARTAMENTO",Value=Data.CORR_DEPARTAMENTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PUESTO",Value=Data.CORR_PUESTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_MODALIDAD",Value=Data.CORR_TIPO_MODALIDAD,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_VACANTE",Value=Data.CORR_TIPO_VACANTE,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CANTIDAD_PLAZAS",Value=Data.CANTIDAD_PLAZAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PLAZAS_CUBIERTAS",Value=Data.PLAZAS_CUBIERTAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="FECHA_REQUISICION",Value=Data.FECHA_REQUISICION,DbType=System.Data.DbType.Date},
                    new CParameter() {ParameterName="JUSTIFICACION",Value=Data.JUSTIFICACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_EMPLEADO_SUSTITUTO",Value=Data.CORR_EMPLEADO_SUSTITUTO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="SALARIO_MINIMO",Value=Data.SALARIO_MINIMO,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="SALARIO_MAXIMO",Value=Data.SALARIO_MAXIMO,DbType=System.Data.DbType.Decimal},
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
                    new CParameter() {ParameterName="CORR_DESCRIPTOR",Value=Data.CORR_DESCRIPTOR,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_DEPARTAMENTO",Value=Data.CORR_DEPARTAMENTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_PUESTO",Value=Data.CORR_PUESTO,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_MODALIDAD",Value=Data.CORR_TIPO_MODALIDAD,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CORR_TIPO_VACANTE",Value=Data.CORR_TIPO_VACANTE,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="CANTIDAD_PLAZAS",Value=Data.CANTIDAD_PLAZAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="PLAZAS_CUBIERTAS",Value=Data.PLAZAS_CUBIERTAS,DbType=System.Data.DbType.Int32},
                    new CParameter() {ParameterName="FECHA_REQUISICION",Value=Data.FECHA_REQUISICION,DbType=System.Data.DbType.Date},
                    new CParameter() {ParameterName="JUSTIFICACION",Value=Data.JUSTIFICACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_EMPLEADO_SUSTITUTO",Value=Data.CORR_EMPLEADO_SUSTITUTO,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="SALARIO_MINIMO",Value=Data.SALARIO_MINIMO,DbType=System.Data.DbType.Decimal},
                    new CParameter() {ParameterName="SALARIO_MAXIMO",Value=Data.SALARIO_MAXIMO,DbType=System.Data.DbType.Decimal},
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
    }
}
