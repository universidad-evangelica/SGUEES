using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;
using SGUEES.Models;

namespace sguees.Repositories
{
	public class SC_SOLICITUD_EMPLEORepository: BaseRepository<SC_SOLICITUD_EMPLEOTable>, ISC_SOLICITUD_EMPLEORepository
	{
		private const string _TableName = "SC_SOLICITUD_EMPLEO";
		
		public SC_SOLICITUD_EMPLEORepository(IConfiguration config) : 
				base(config.GetConnectionString("defaultConnection"),
					 config.GetSection("DbProvider:defaultProvider").Value)
		{
		}
		
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			
			try
			{
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).ToList();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
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
				var reader = await objData.GetDataReader("V_"+_TableName, xWhere);
				var response = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper =  0;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> CreateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLICITUD_EMPLEO",Value=Data.CORR_SOLICITUD_EMPLEO,DbType=System.Data.DbType.Int32,Direction=System.Data.ParameterDirection.InputOutput},
                    new CParameter() {ParameterName="FECHA_GENERACION",Value=Data.FECHA_GENERACION,DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="CORREO_INVITACION",Value=Data.CORREO_INVITACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="DUI",Value=Data.DUI,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="NOMBRE",Value=Data.NOMBRE,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_PERSONA_DATOS",Value=null,DbType=System.Data.DbType.Int32},
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
				
				var reader = await objData.Insert(_TableName,p,"CORR_SOLICITUD_EMPLEO",pWhere);
				var response = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SOLICITUD_EMPLEO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> UpdateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var p = new List<CParameter>
				{
                    new CParameter() {ParameterName="FECHA_GENERACION",Value=Data.FECHA_GENERACION,DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="CORREO_INVITACION",Value=Data.CORREO_INVITACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
					new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
				};

				if ((Data.CORR_PERSONA_DATOS ?? 0) <= 0)
				{
					p.Insert(2, new CParameter() { ParameterName = "DUI", Value = Data.DUI, DbType = System.Data.DbType.String });
					p.Insert(3, new CParameter() { ParameterName = "NOMBRE", Value = Data.NOMBRE, DbType = System.Data.DbType.String });
				}
				
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLICITUD_EMPLEO",Value=Data.CORR_SOLICITUD_EMPLEO,DbType=System.Data.DbType.Int32},
				};
				
				var reader = await objData.Update(_TableName,p,pWhere);
				var response = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).FirstOrDefault();
				
				reader.Close();
				reader = null;
				
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response.CORR_SOLICITUD_EMPLEO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}
		
		public async Task<CResult> DeleteAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
					new CParameter() {ParameterName="CORR_SOLICITUD_EMPLEO",Value=Data.CORR_SOLICITUD_EMPLEO,DbType=System.Data.DbType.Int32},
				};
				
				objResultado.RowsAffected = (int) await objData.Delete(_TableName,pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_SOLICITUD_EMPLEO;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource ="";
			}
			catch (System.Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode =  -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}
			
			return objResultado;
		}

        ////Funcion para hacer update solo a ACTIVO para inactivar item
        //public async Task<CResult> DesactivateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION)
        //{
        //    CResult objResultado = new();

        //    try
        //    {
        //        var p = new List<CParameter>
        //        {
        //            new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
        //            new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
        //            new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
        //            new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
        //        };

        //        var pWhere = new List<CParameter>
        //        {
        //            new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
        //            new CParameter() {ParameterName="CORR_TIPO_VACANTE",Value=Data.CORR_TIPO_VACANTE,DbType=System.Data.DbType.Int32},
        //        };

        //        var reader = await objData.Update(_TableName, p, pWhere);
        //        var response = new List<SC_TIPO_VACANTEView>().FromDataReader(reader).FirstOrDefault();

        //        reader.Close();
        //        reader = null;

        //        objResultado.Data = response;
        //        objResultado.Result = true;
        //        objResultado.RowsAffected = 1;
        //        objResultado.CodeHelper = response.CORR_TIPO_VACANTE;
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

        ////Funcion para hacer update solo a ACTIVO para reactivar item
        //public async Task<CResult> ReactivateAsync(SC_TIPO_VACANTETable Data, string vLOGIN_SISTEMA, string vESTACION)
        //{
        //    CResult objResultado = new();

        //    try
        //    {
        //        var p = new List<CParameter>
        //        {
        //            new CParameter() {ParameterName="ACTIVO",Value=Data.ACTIVO,DbType=System.Data.DbType.Boolean},
        //            new CParameter() {ParameterName="USUARIO_ACTU",Value=Data.USUARIO_ACTU,DbType=System.Data.DbType.String},
        //            new CParameter() {ParameterName="ESTACION_ACTU",Value=Data.ESTACION_ACTU,DbType=System.Data.DbType.String},
        //            new CParameter() {ParameterName="FECHA_ACTU",Value=Data.FECHA_ACTU,DbType=System.Data.DbType.DateTime},
        //        };

        //        var pWhere = new List<CParameter>
        //        {
        //            new CParameter() {ParameterName="CORR_EMPRESA",Value=Data.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
        //            new CParameter() {ParameterName="CORR_TIPO_VACANTE",Value=Data.CORR_TIPO_VACANTE,DbType=System.Data.DbType.Int32},
        //        };

        //        var reader = await objData.Update(_TableName, p, pWhere);
        //        var response = new List<SC_TIPO_VACANTEView>().FromDataReader(reader).FirstOrDefault();

        //        reader.Close();
        //        reader = null;

        //        objResultado.Data = response;
        //        objResultado.Result = true;
        //        objResultado.RowsAffected = 1;
        //        objResultado.CodeHelper = response.CORR_TIPO_VACANTE;
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
    }
}
