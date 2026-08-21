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
    }
}
