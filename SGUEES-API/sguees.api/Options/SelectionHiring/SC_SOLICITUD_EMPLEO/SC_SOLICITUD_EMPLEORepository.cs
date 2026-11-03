using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
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
                    // Solo el correlativo: ES_PERMANENTE se resuelve en la vista con JOIN al catálogo.
                    new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
                    // Qué hace: vincula el CORR_PERSONA_DATOS si se detectó un candidato existente o asigna null si es candidato nuevo.
                    // Cómo lo hace: evalúa si Data.CORR_PERSONA_DATOS tiene un valor positivo; si no, envía DBNull.Value.
                    new CParameter() {ParameterName="CORR_PERSONA_DATOS",Value=(Data.CORR_PERSONA_DATOS.HasValue && Data.CORR_PERSONA_DATOS.Value > 0) ? (object)Data.CORR_PERSONA_DATOS.Value : DBNull.Value, DbType=System.Data.DbType.Int32},
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
				if (response != null && (Data.CORR_PERSONA_DATOS ?? 0) > 0)
				{
					// Qué hace: asocia automáticamente la nueva solicitud al expediente existente de la persona en SC_EXPEDIENTE_SOLICITUD.
					// Cómo lo hace: verifica si la persona posee expediente y añade el detalle si aún no está vinculado.
					await AsociarExpedienteExistenteSiAplicaAsync(Data.CORR_EMPRESA, response.CORR_SOLICITUD_EMPLEO, Data.CORR_PERSONA_DATOS.Value, vLOGIN_SISTEMA, vESTACION);
				}
				
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
				if (await SolicitudYaAsociadaExpedienteAsync(Data.CORR_EMPRESA, Data.CORR_SOLICITUD_EMPLEO))
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 1004;
					objResultado.ErrorMessage = "La solicitud ya está asociada al expediente; no se puede modificar (solo consulta).";
					objResultado.ErrorSource = "[SC_SOLICITUD_EMPLEORepository]";
					return objResultado;
				}

				var p = new List<CParameter>
				{
                    new CParameter() {ParameterName="FECHA_GENERACION",Value=Data.FECHA_GENERACION,DbType=System.Data.DbType.DateTime},
                    new CParameter() {ParameterName="CORREO_INVITACION",Value=Data.CORREO_INVITACION,DbType=System.Data.DbType.String},
                    new CParameter() {ParameterName="CORR_TIPO_CONTRATACION",Value=Data.CORR_TIPO_CONTRATACION,DbType=System.Data.DbType.Int32},
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

		/// <summary>
		/// RRHH: UPDATE persona (sin Confirmación) + replace colecciones vía SP XML.
		/// </summary>
		public async Task<CResult> ActualizarPersonaDatosAsync(
			int corrEmpresa,
			string usuario,
			string estacion,
			SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARParam data)
		{
			CResult resultado = new();
			try
			{
				if (data != null && await SolicitudYaAsociadaPorPersonaAsync(corrEmpresa, data.CORR_PERSONA_DATOS))
				{
					resultado.Result = false;
					resultado.ErrorCode = 1004;
					resultado.ErrorMessage = "La solicitud ya está asociada al expediente; los datos de persona son solo consulta.";
					resultado.ErrorSource = "[SC_SOLICITUD_EMPLEORepository]";
					return resultado;
				}
				var parametros = new List<CParameter>
				{
					new() { ParameterName = "@CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_SOLICITUD_EMPLEO", Value = data.CORR_SOLICITUD_EMPLEO, DbType = DbType.Int32 },
					new() { ParameterName = "@CORR_PERSONA_DATOS", Value = data.CORR_PERSONA_DATOS, DbType = DbType.Int32 },
					new() { ParameterName = "@NOMBRE1", Value = ToDbValue(data.NOMBRE1), DbType = DbType.String },
					new() { ParameterName = "@NOMBRE2", Value = ToDbValue(data.NOMBRE2), DbType = DbType.String },
					new() { ParameterName = "@APELLIDO1", Value = ToDbValue(data.APELLIDO1), DbType = DbType.String },
					new() { ParameterName = "@APELLIDO2", Value = ToDbValue(data.APELLIDO2), DbType = DbType.String },
					new() { ParameterName = "@FECHA_NACIMIENTO", Value = data.FECHA_NACIMIENTO, DbType = DbType.Date },
					new() { ParameterName = "@EDAD", Value = data.EDAD, DbType = DbType.Int32 },
					new() { ParameterName = "@ESTADO_CIVIL", Value = ToDbValue(data.ESTADO_CIVIL), DbType = DbType.String },
					new() { ParameterName = "@NACIONALIDAD", Value = ToDbValue(data.NACIONALIDAD), DbType = DbType.String },
					new() { ParameterName = "@CORREO", Value = ToDbValue(data.CORREO), DbType = DbType.String },
					new() { ParameterName = "@CELULAR", Value = ToDbValue(data.CELULAR), DbType = DbType.String },
					new() { ParameterName = "@TELEFONO", Value = ToDbValue(data.TELEFONO), DbType = DbType.String },
					new() { ParameterName = "@DIRECCION", Value = ToDbValue(data.DIRECCION), DbType = DbType.String },
					new() { ParameterName = "@DUI", Value = ToDbValue(data.DUI), DbType = DbType.String },
					new() { ParameterName = "@PASAPORTE", Value = ToDbValue(data.PASAPORTE), DbType = DbType.String },
					new() { ParameterName = "@ISSS", Value = ToDbValue(data.ISSS), DbType = DbType.String },
					new() { ParameterName = "@AFP", Value = ToDbValue(data.AFP), DbType = DbType.String },
					new() { ParameterName = "@NOMBRE_AFP", Value = ToDbValue(data.NOMBRE_AFP), DbType = DbType.String },
					new() { ParameterName = "@LICENCIA", Value = ToDbValue(data.LICENCIA), DbType = DbType.String },
					new() { ParameterName = "@PLAZA_SOLICITADA", Value = ToDbValue(data.PLAZA_SOLICITADA), DbType = DbType.String },
					new() { ParameterName = "@PRETENSION_SALARIAL", Value = data.PRETENSION_SALARIAL, DbType = DbType.Int32 },
					new() { ParameterName = "@DISPONIBILIDAD", Value = ToDbValue(data.DISPONIBILIDAD), DbType = DbType.String },
					new() { ParameterName = "@RELIGION", Value = ToDbValue(data.RELIGION), DbType = DbType.String },
					new() { ParameterName = "@IGLESIA", Value = ToDbValue(data.IGLESIA), DbType = DbType.String },
					new() { ParameterName = "@DIRECCION_IGLESIA", Value = ToDbValue(data.DIRECCION_IGLESIA), DbType = DbType.String },
					new() { ParameterName = "@ES_CONTRIBUYENTE_CCF", Value = data.ES_CONTRIBUYENTE_CCF, DbType = DbType.Boolean },
					new() { ParameterName = "@ES_JUBILADO", Value = data.ES_JUBILADO, DbType = DbType.Boolean },
					new() { ParameterName = "@POSEE_DISCAPACIDAD", Value = data.POSEE_DISCAPACIDAD, DbType = DbType.Boolean },
					new() { ParameterName = "@TIPO_DISCAPACIDAD", Value = ToDbValue(data.TIPO_DISCAPACIDAD), DbType = DbType.String },
					new() { ParameterName = "@EMERGENCIA_NOMBRE", Value = ToDbValue(data.EMERGENCIA_NOMBRE), DbType = DbType.String },
					new() { ParameterName = "@EMERGENCIA_PARENTESCO", Value = ToDbValue(data.EMERGENCIA_PARENTESCO), DbType = DbType.String },
					new() { ParameterName = "@EMERGENCIA_TELEFONO", Value = ToDbValue(data.EMERGENCIA_TELEFONO), DbType = DbType.String },
					new() { ParameterName = "@TIENE_FAMILIARES_UEES", Value = data.TIENE_FAMILIARES_UEES, DbType = DbType.Boolean },
					new() { ParameterName = "@FOTO_URL", Value = ToDbValue(data.FOTO_URL), DbType = DbType.String },
					new() { ParameterName = "@USUARIO_AUDITORIA", Value = usuario ?? "RRHH", DbType = DbType.String },
					new() { ParameterName = "@ESTACION_AUDITORIA", Value = estacion ?? "SGUEES", DbType = DbType.String },
					new() { ParameterName = "@FAMILIARES_DIRECTOS_XML", Value = ToFamiliaresXml(data.FAMILIARES_DIRECTOS), DbType = DbType.String },
					new() { ParameterName = "@HIJOS_XML", Value = ToHijosXml(data.HIJOS), DbType = DbType.String },
					new() { ParameterName = "@ESTUDIOS_XML", Value = ToEstudiosXml(data.ESTUDIOS), DbType = DbType.String },
					new() { ParameterName = "@IDIOMAS_XML", Value = ToIdiomasXml(data.IDIOMAS), DbType = DbType.String },
					new() { ParameterName = "@COMPETENCIAS_XML", Value = ToCompetenciasXml(data.COMPETENCIAS), DbType = DbType.String },
					new() { ParameterName = "@EXPERIENCIAS_XML", Value = ToExperienciasXml(data.EXPERIENCIAS), DbType = DbType.String },
					new() { ParameterName = "@FAMILIARES_UEES_XML", Value = ToFamiliaresUeesXml(data.FAMILIARES_UEES), DbType = DbType.String },
				};

				var reader = await objData.GetDataReader(
					CommandType.StoredProcedure,
					"PRAL_MTTO_SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZAR",
					parametros);
				var response = new List<SC_SOLICITUD_EMPLEO_PERSONA_ACTUALIZARView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				resultado.Data = response;
				resultado.Result = response?.ACTUALIZADO == true;
				resultado.RowsAffected = response?.ACTUALIZADO == true ? 1 : 0;
				resultado.CodeHelper = response?.CORR_PERSONA_DATOS ?? 0;
				resultado.ErrorCode = response?.ACTUALIZADO == true ? 0 : -1;
				resultado.ErrorMessage = response?.ACTUALIZADO == true
					? ""
					: "No fue posible actualizar los datos del candidato.";
			}
			catch (Exception e)
			{
				resultado.Data = null;
				resultado.Result = false;
				resultado.RowsAffected = 0;
				resultado.ErrorCode = -1;
				resultado.ErrorMessage = e.Message;
				resultado.ErrorSource = $"[{e.Source}]";
			}
			finally
			{
				objData.objConnection.Close();
			}

			return resultado;
		}

		private static object ToDbValue(string value)
		{
			return string.IsNullOrWhiteSpace(value) ? DBNull.Value : value;
		}

		private static string ToFamiliaresXml(IEnumerable<SC_PERSONA_FAMILIARTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "TIPO", x.TIPO);
				SetAttr(row, "NOMBRE", x.NOMBRE);
				SetAttr(row, "DOMICILIO", x.DOMICILIO);
				SetAttr(row, "FECHA_NACIMIENTO", x.FECHA_NACIMIENTO);
				SetAttr(row, "OCUPACION", x.OCUPACION);
			});
		}

		private static string ToHijosXml(IEnumerable<SC_PERSONA_HIJOSTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "NOMBRE", x.NOMBRE);
				SetAttr(row, "EDAD", x.EDAD);
				SetAttr(row, "SEXO", x.SEXO);
				SetAttr(row, "FECHA_NACIMIENTO", x.FECHA_NACIMIENTO);
			});
		}

		private static string ToEstudiosXml(IEnumerable<SC_PERSONA_ESTUDIOTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "NIVEL", x.NIVEL);
				SetAttr(row, "INSTITUCION", x.INSTITUCION);
				SetAttr(row, "DESDE", x.DESDE);
				SetAttr(row, "HASTA", x.HASTA);
				SetAttr(row, "TITULO", x.TITULO);
			});
		}

		private static string ToIdiomasXml(IEnumerable<SC_PERSONA_IDIOMASTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "IDIOMA", x.IDIOMA);
				SetAttr(row, "NIVEL", x.NIVEL);
			});
		}

		private static string ToCompetenciasXml(IEnumerable<SC_PERSONA_COMPETENCIAS_TECNICASTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "HERRAMIENTA", x.HERRAMIENTA);
				SetAttr(row, "NIVEL", x.NIVEL);
			});
		}

		private static string ToExperienciasXml(IEnumerable<SC_PERSONA_EXPERIENCIA_LABORALTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "EMPRESA", x.EMPRESA);
				SetAttr(row, "TELEFONO", x.TELEFONO);
				SetAttr(row, "CARGO", x.CARGO);
				SetAttr(row, "JEFE_INMEDIATO", x.JEFE_INMEDIATO);
				SetAttr(row, "FECHA_INICIO", x.FECHA_INICIO);
				SetAttr(row, "FECHA_FIN", x.FECHA_FIN);
				SetAttr(row, "SALARIO_INICIAL", x.SALARIO_INICIAL);
				SetAttr(row, "SALARIO_FINAL", x.SALARIO_FINAL);
				SetAttr(row, "MOTIVO_SALIDA", x.MOTIVO_SALIDA);
			});
		}

		private static string ToFamiliaresUeesXml(IEnumerable<SC_PERSONA_FAMILIAR_UEESTable> items)
		{
			return BuildRowsXml(items, (row, x) =>
			{
				SetAttr(row, "NOMBRE", x.NOMBRE);
				SetAttr(row, "PARENTESCO", x.PARENTESCO);
				SetAttr(row, "UNIDAD", x.UNIDAD);
				SetAttr(row, "TELEFONO", x.TELEFONO);
			});
		}

		private static string BuildRowsXml<T>(IEnumerable<T> items, Action<XElement, T> map)
		{
			var root = new XElement("rows");
			foreach (var item in items ?? Enumerable.Empty<T>())
			{
				if (item == null)
				{
					continue;
				}

				var row = new XElement("row");
				map(row, item);
				if (row.HasAttributes)
				{
					root.Add(row);
				}
			}

			return root.ToString(SaveOptions.DisableFormatting);
		}

		private async Task<bool> SolicitudYaAsociadaExpedienteAsync(int corrEmpresa, int corrSolicitudEmpleo)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader("SC_EXPEDIENTE_SOLICITUD", p);
			var tiene = reader.HasRows;
			while (reader.Read()) { /* drain */ }
			reader.Close();
			objData.objConnection.Close();
			return tiene;
		}

		/// <summary>True si alguna solicitud con esa persona ya está en SC_EXPEDIENTE_SOLICITUD.</summary>
		private async Task<bool> SolicitudYaAsociadaPorPersonaAsync(int corrEmpresa, int corrPersonaDatos)
		{
			if (corrPersonaDatos <= 0)
			{
				return false;
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = corrPersonaDatos, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader("V_SC_SOLICITUD_EMPLEO", p);
			var solicitudes = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(reader).ToList();
			reader.Close();
			objData.objConnection.Close();

			foreach (var s in solicitudes)
			{
				if (await SolicitudYaAsociadaExpedienteAsync(corrEmpresa, s.CORR_SOLICITUD_EMPLEO))
				{
					return true;
				}
			}

			return false;
		}

		private static void SetAttr(XElement row, string name, string value)
		{
			if (!string.IsNullOrWhiteSpace(value))
			{
				row.SetAttributeValue(name, value.Trim());
			}
		}

		private static void SetAttr(XElement row, string name, int? value)
		{
			if (value.HasValue)
			{
				row.SetAttributeValue(name, value.Value.ToString(CultureInfo.InvariantCulture));
			}
		}

		private static void SetAttr(XElement row, string name, decimal? value)
		{
			if (value.HasValue)
			{
				row.SetAttributeValue(name, value.Value.ToString(CultureInfo.InvariantCulture));
			}
		}

		private static void SetAttr(XElement row, string name, DateTime? value)
		{
			if (value.HasValue)
			{
				row.SetAttributeValue(name, value.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
			}
		}

		// Qué hace: obtiene las plantillas de correo activas configuradas para la vista de Solicitud de Empleo.
		// Cómo lo hace: consulta GEN_PARAMETRO_PLANTILLA uniendo su versión activa, filtrando por ACTIVO_PLANTILLA = 1 y CODIGO_OPCION = 'SC_SOLICITUD_EMPLEO'.
		public async Task<CResult> GetPlantillasDisponiblesAsync(int corrEmpresa)
		{
			CResult objResultado = new();
			try
			{
				string sql = @"
					SELECT 
						p.CORR_PARAMETRO_PLANTILLA,
						p.CODIGO_PLANTILLA,
						p.NOMBRE_PLANTILLA,
						ISNULL(v.ASUNTO_PLANTILLA, p.ASUNTO_PLANTILLA) AS ASUNTO_PLANTILLA,
						ISNULL(v.CUERPO_PLANTILLA, p.CUERPO_PLANTILLA) AS CUERPO_PLANTILLA,
						p.CORR_PARAMETRO_SMTP,
						ISNULL(v.CORREO_CC, p.CORREO_CC) AS CORREO_CC,
						ISNULL(v.CORREO_CCO, p.CORREO_CCO) AS CORREO_CCO
					FROM dbo.GEN_PARAMETRO_PLANTILLA p
					LEFT JOIN dbo.GEN_PARAMETRO_PLANTILLA_VERSION v 
						ON v.CORR_PARAMETRO_PLANTILLA = p.CORR_PARAMETRO_PLANTILLA 
					   AND v.CORR_EMPRESA = p.CORR_EMPRESA 
					   AND v.ES_VERSION_ACTIVA = 1
					WHERE p.CORR_EMPRESA = @CORR_EMPRESA
					  AND p.ACTIVO_PLANTILLA = 1
					  AND (
					      p.CODIGO_OPCION = 'SC_SOLICITUD_EMPLEO'
					      OR (p.CODIGO_SISTEMA = 'SELECCIONCONTRATACION' AND (p.CODIGO_OPCION IS NULL OR p.CODIGO_OPCION = ''))
					  )
					ORDER BY p.NOMBRE_PLANTILLA;";

				var p = new List<CParameter>
				{
					new CParameter { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 }
				};

				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				var list = new List<dynamic>();
				while (reader.Read())
				{
					list.Add(new
					{
						CORR_PARAMETRO_PLANTILLA = Convert.ToInt32(reader["CORR_PARAMETRO_PLANTILLA"]),
						CODIGO_PLANTILLA = reader["CODIGO_PLANTILLA"].ToString(),
						NOMBRE_PLANTILLA = reader["NOMBRE_PLANTILLA"].ToString(),
						ASUNTO_PLANTILLA = reader["ASUNTO_PLANTILLA"]?.ToString() ?? "",
						CUERPO_PLANTILLA = reader["CUERPO_PLANTILLA"]?.ToString() ?? "",
						CORR_PARAMETRO_SMTP = Convert.ToInt32(reader["CORR_PARAMETRO_SMTP"]),
						CORREO_CC = reader["CORREO_CC"]?.ToString() ?? "",
						CORREO_CCO = reader["CORREO_CCO"]?.ToString() ?? ""
					});
				}
				reader.Close();
				objResultado.Data = list;
				objResultado.Result = true;
				objResultado.RowsAffected = list.Count;
			}
			catch (Exception e)
			{
				objResultado.Result = false;
				objResultado.ErrorMessage = e.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return objResultado;
		}

		// Qué hace: obtiene los datos consolidados de la solicitud, la plantilla y la configuración SMTP para el envío.
		// Cómo lo hace: ejecuta consultas a V_SC_SOLICITUD_EMPLEO, GEN_PARAMETRO_PLANTILLA y GEN_PARAMETRO_SMTP.
		public async Task<dynamic> ObtenerConfiguracionEnvioAsync(int corrEmpresa, int corrSolicitudEmpleo, int corrParametroPlantilla)
		{
			try
			{
				string sql = @"
					SELECT TOP 1 
						s.CORR_SOLICITUD_EMPLEO,
						s.NOMBRE AS NOMBRE_CANDIDATO,
						s.DUI AS DUI_CANDIDATO,
						s.CORREO_INVITACION,
						s.NOMBRE_TIPO_CONTRATACION,
						ISNULL(sr.NOMBRE_PUESTO, '') AS NOMBRE_PUESTO,
						p.CORR_PARAMETRO_PLANTILLA,
						p.NOMBRE_PLANTILLA,
						ISNULL(v.ASUNTO_PLANTILLA, p.ASUNTO_PLANTILLA) AS ASUNTO_ORIGINAL,
						ISNULL(v.CUERPO_PLANTILLA, p.CUERPO_PLANTILLA) AS CUERPO_ORIGINAL,
						ISNULL(v.CORREO_CC, p.CORREO_CC) AS CORREO_CC,
						ISNULL(v.CORREO_CCO, p.CORREO_CCO) AS CORREO_CCO,
						smtp.SERVIDOR_CORREO,
						smtp.PUERTO_CORREO,
						smtp.USA_SSL_CORREO,
						smtp.USUARIO_REMITENTE,
						smtp.CONTRASENA_REMITENTE,
						smtp.CORREO_REMITENTE
					FROM dbo.V_SC_SOLICITUD_EMPLEO s
					LEFT JOIN dbo.V_SC_SOLICITUD_REQUISICION sr
						ON sr.CORR_EMPRESA = s.CORR_EMPRESA
					   AND sr.CORR_SOLICITUD_EMPLEO = s.CORR_SOLICITUD_EMPLEO
					CROSS JOIN dbo.GEN_PARAMETRO_PLANTILLA p
					LEFT JOIN dbo.GEN_PARAMETRO_PLANTILLA_VERSION v 
						ON v.CORR_PARAMETRO_PLANTILLA = p.CORR_PARAMETRO_PLANTILLA 
					   AND v.CORR_EMPRESA = p.CORR_EMPRESA 
					   AND v.ES_VERSION_ACTIVA = 1
					JOIN dbo.GEN_PARAMETRO_SMTP smtp 
						ON smtp.CORR_PARAMETRO_SMTP = p.CORR_PARAMETRO_SMTP
					WHERE s.CORR_EMPRESA = @CORR_EMPRESA
					  AND s.CORR_SOLICITUD_EMPLEO = @CORR_SOLICITUD_EMPLEO
					  AND p.CORR_PARAMETRO_PLANTILLA = @CORR_PARAMETRO_PLANTILLA;";

				var p = new List<CParameter>
				{
					new CParameter { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new CParameter { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = DbType.Int32 },
					new CParameter { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = corrParametroPlantilla, DbType = DbType.Int32 }
				};

				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				dynamic config = null;
				if (reader.Read())
				{
					var expando = new System.Dynamic.ExpandoObject();
					var dict = (IDictionary<string, object>)expando;
					for (int i = 0; i < reader.FieldCount; i++)
					{
						string colName = reader.GetName(i);
						if (reader.IsDBNull(i))
						{
							dict[colName] = reader.GetFieldType(i) == typeof(string) ? "" : null;
						}
						else
						{
							dict[colName] = reader.GetValue(i);
						}
					}
					config = expando;
				}
				reader.Close();
				return config;
			}
			finally
			{
				objData.objConnection.Close();
			}
		}

		// Qué hace: busca si existe un candidato con expediente previo por su documento de identidad (DUI).
		// Cómo lo hace: normaliza el DUI retirando guiones y espacios y consulta SC_PERSONA_DATOS junto a SC_EXPEDIENTE_CANDIDATO.
		public async Task<CResult> BuscarCandidatoPorDuiAsync(int corrEmpresa, string dui)
		{
			CResult objResultado = new();
			try
			{
				string duiNorm = (dui ?? "").Trim().Replace("-", "").Replace(" ", "").ToUpperInvariant();
				string sql = @"
					SELECT TOP 1
						P.CORR_PERSONA_DATOS,
						E.CORR_EXPEDIENTE_CANDIDATO,
						P.DUI,
						LTRIM(RTRIM(CONCAT(P.NOMBRE1, ' ', ISNULL(P.NOMBRE2, ''), ' ', P.APELLIDO1, ' ', ISNULL(P.APELLIDO2, '')))) AS NOMBRE_COMPLETO,
						P.CORREO,
						P.CELULAR,
						P.TELEFONO,
						E.CORR_ESTADO_EXPEDIENTE
					FROM dbo.SC_PERSONA_DATOS P
					LEFT JOIN dbo.SC_EXPEDIENTE_CANDIDATO E 
						ON P.CORR_EMPRESA = E.CORR_EMPRESA AND P.CORR_PERSONA_DATOS = E.CORR_PERSONA_DATOS
					WHERE P.CORR_EMPRESA = @CORR_EMPRESA
					  AND UPPER(REPLACE(REPLACE(LTRIM(RTRIM(P.DUI)), '-', ''), ' ', '')) = @DUI_NORM
					ORDER BY ISNULL(E.CORR_EXPEDIENTE_CANDIDATO, 0) DESC, P.CORR_PERSONA_DATOS DESC;";

				var p = new List<CParameter>
				{
					new CParameter { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new CParameter { ParameterName = "DUI_NORM", Value = duiNorm, DbType = DbType.String }
				};

				var reader = await objData.GetDataReader(CommandType.Text, sql, p);
				if (reader.Read())
				{
					objResultado.Data = new
					{
						CORR_PERSONA_DATOS = reader.GetInt32(reader.GetOrdinal("CORR_PERSONA_DATOS")),
						CORR_EXPEDIENTE_CANDIDATO = !reader.IsDBNull(reader.GetOrdinal("CORR_EXPEDIENTE_CANDIDATO")) ? reader.GetInt32(reader.GetOrdinal("CORR_EXPEDIENTE_CANDIDATO")) : (int?)null,
						DUI = reader.GetString(reader.GetOrdinal("DUI")),
						NOMBRE_COMPLETO = reader.GetString(reader.GetOrdinal("NOMBRE_COMPLETO")),
						CORREO = reader.GetString(reader.GetOrdinal("CORREO")),
						CELULAR = !reader.IsDBNull(reader.GetOrdinal("CELULAR")) ? reader.GetString(reader.GetOrdinal("CELULAR")) : null,
						TELEFONO = !reader.IsDBNull(reader.GetOrdinal("TELEFONO")) ? reader.GetString(reader.GetOrdinal("TELEFONO")) : null
					};
					objResultado.RowsAffected = 1;
				}
				else
				{
					objResultado.Data = null;
					objResultado.RowsAffected = 0;
				}
				reader.Close();

				objResultado.Result = true;
				objResultado.ErrorCode = 0;
			}
			catch (Exception ex)
			{
				objResultado.Result = false;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = ex.Message;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return objResultado;
		}

		// Qué hace: asocia la solicitud de empleo recién creada al expediente existente del candidato en SC_EXPEDIENTE_SOLICITUD.
		// Cómo lo hace: ejecuta el procedimiento almacenado PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD si la persona ya posee expediente.
		private async Task AsociarExpedienteExistenteSiAplicaAsync(int corrEmpresa, int corrSolicitudEmpleo, int corrPersonaDatos, string usuario, string estacion)
		{
			try
			{
				var pAsociar = new List<CParameter>
				{
					new CParameter { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new CParameter { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = DbType.Int32 },
					new CParameter { ParameterName = "CREAR_EXPEDIENTE", Value = false, DbType = DbType.Boolean },
					new CParameter { ParameterName = "SOLO_CONSULTA", Value = false, DbType = DbType.Boolean },
					new CParameter { ParameterName = "SYS_LOGIN_USUARIO", Value = usuario ?? "e-CoffeeTech", DbType = DbType.String },
					new CParameter { ParameterName = "SYS_ESTACION", Value = estacion ?? "e-CoffeeTech", DbType = DbType.String },
					new CParameter { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = null, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new CParameter { ParameterName = "ESTADO", Value = null, DbType = DbType.String, Size = 30, Direction = ParameterDirection.Output },
					new CParameter { ParameterName = "SYS_FILAS_AFECTADAS", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new CParameter { ParameterName = "SYS_NUMERO_ERROR", Value = 0, DbType = DbType.Int32, Direction = ParameterDirection.Output },
					new CParameter { ParameterName = "SYS_MENSAJE_ERROR", Value = "", DbType = DbType.String, Size = 4000, Direction = ParameterDirection.Output }
				};

				await objData.ExecCmd(CommandType.StoredProcedure, "PRAL_MTTO_SC_EXPEDIENTE_ASOCIAR_SOLICITUD", true, pAsociar);
			}
			catch
			{
				// La asociación automática no interrumpe el éxito de la inserción de la solicitud
			}
			finally
			{
				objData.objConnection.Close();
			}
		}
    }
}
