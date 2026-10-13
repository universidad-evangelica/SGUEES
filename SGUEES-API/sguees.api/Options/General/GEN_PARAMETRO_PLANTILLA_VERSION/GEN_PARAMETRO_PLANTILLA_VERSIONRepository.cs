// Qué hace: repositorio de acceso a datos para versiones de plantillas de correo.
// Cómo lo hace: consulta V_GEN_PARAMETRO_PLANTILLA_VERSION, calcula el correlativo NUMERO_VERSION y sincroniza la versión activa con la tabla principal GEN_PARAMETRO_PLANTILLA.
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class GEN_PARAMETRO_PLANTILLA_VERSIONRepository : BaseRepository<GEN_PARAMETRO_PLANTILLA_VERSIONTable>, IGEN_PARAMETRO_PLANTILLA_VERSIONRepository
	{
		private const string _TableName = "GEN_PARAMETRO_PLANTILLA_VERSION";

		public GEN_PARAMETRO_PLANTILLA_VERSIONRepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista todas las versiones de una plantilla en orden descendente.
		// Cómo lo hace: consulta la vista V_GEN_PARAMETRO_PLANTILLA_VERSION filtrada por empresa y plantilla.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLA_VERSIONView>().FromDataReader(reader).OrderByDescending(x => x.NUMERO_VERSION).ToList();

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

		// Qué hace: obtiene una versión específica de la plantilla.
		// Cómo lo hace: consulta V_GEN_PARAMETRO_PLANTILLA_VERSION filtrada por empresa, plantilla y número de versión.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();

			try
			{
				var reader = await objData.GetDataReader("V_" + _TableName, xWhere);
				var response = new List<GEN_PARAMETRO_PLANTILLA_VERSIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
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

		// Qué hace: crea una nueva versión de la plantilla con correlativo automático.
		// Cómo lo hace: si es activa, desactiva las anteriores; inserta la nueva versión en GEN_PARAMETRO_PLANTILLA_VERSION y sincroniza la cabecera GEN_PARAMETRO_PLANTILLA.
		public async Task<CResult> CreateAsync(GEN_PARAMETRO_PLANTILLA_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWherePlantilla = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 }
				};

				if (Data.ES_VERSION_ACTIVA)
				{
					var pDesactivar = new List<CParameter>
					{
						new CParameter() { ParameterName = "ES_VERSION_ACTIVA", Value = false, DbType = System.Data.DbType.Boolean },
						new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime }
					};

					await objData.Update(_TableName, pDesactivar, pWherePlantilla);
				}

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = Data.CORR_PARAMETRO_PLANTILLA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ES_VERSION_ACTIVA", Value = Data.ES_VERSION_ACTIVA, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "MOTIVO_VERSION", Value = Data.MOTIVO_VERSION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime }
				};

				var reader = await objData.Insert(_TableName, p, "NUMERO_VERSION", pWherePlantilla);
				var response = new List<GEN_PARAMETRO_PLANTILLA_VERSIONView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				if (Data.ES_VERSION_ACTIVA)
				{
					var pCabecera = new List<CParameter>
					{
						new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = Data.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = Data.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CORREO_CC", Value = Data.CORREO_CC, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CORREO_CCO", Value = Data.CORREO_CCO, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime }
					};

					await objData.Update("GEN_PARAMETRO_PLANTILLA", pCabecera, pWherePlantilla);
				}

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

		// Qué hace: activa una versión específica y desactiva las restantes.
		// Cómo lo hace: actualiza ES_VERSION_ACTIVA = 0 en todas las versiones de la plantilla, luego marca la versión deseada en 1 y sincroniza GEN_PARAMETRO_PLANTILLA.
		public async Task<CResult> ActivarVersionAsync(int corrEmpresa, int corrPlantilla, int numeroVersion, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var pWherePlantilla = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = corrPlantilla, DbType = System.Data.DbType.Int32 }
				};

				var pDesactivar = new List<CParameter>
				{
					new CParameter() { ParameterName = "ES_VERSION_ACTIVA", Value = false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime }
				};

				await objData.Update(_TableName, pDesactivar, pWherePlantilla);

				var pWhereVersion = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PARAMETRO_PLANTILLA", Value = corrPlantilla, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "NUMERO_VERSION", Value = numeroVersion, DbType = System.Data.DbType.Int32 }
				};

				var pActivar = new List<CParameter>
				{
					new CParameter() { ParameterName = "ES_VERSION_ACTIVA", Value = true, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime }
				};

				var reader = await objData.Update(_TableName, pActivar, pWhereVersion);
				var versionActiva = new List<GEN_PARAMETRO_PLANTILLA_VERSIONView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();

				if (versionActiva != null)
				{
					var pCabecera = new List<CParameter>
					{
						new CParameter() { ParameterName = "ASUNTO_PLANTILLA", Value = versionActiva.ASUNTO_PLANTILLA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CUERPO_PLANTILLA", Value = versionActiva.CUERPO_PLANTILLA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CORREO_CC", Value = versionActiva.CORREO_CC, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "CORREO_CCO", Value = versionActiva.CORREO_CCO, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "USUARIO_ACTU", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "ESTACION_ACTU", Value = vESTACION, DbType = System.Data.DbType.String },
						new CParameter() { ParameterName = "FECHA_ACTU", Value = System.DateTime.Now, DbType = System.Data.DbType.DateTime }
					};

					await objData.Update("GEN_PARAMETRO_PLANTILLA", pCabecera, pWherePlantilla);
				}

				objResultado.Data = versionActiva;
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
	}
}
