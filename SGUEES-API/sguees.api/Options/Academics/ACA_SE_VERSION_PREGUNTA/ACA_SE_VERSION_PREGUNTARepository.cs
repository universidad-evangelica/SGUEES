// Qué hace: persistencia SQL de preguntas por versión socioeconómico.
// Cómo lo hace: CRUD y ActivarInactivar sobre ACA_SE_VERSION_PREGUNTA / V_ACA_SE_VERSION_PREGUNTA (sin empresa).
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class ACA_SE_VERSION_PREGUNTARepository : BaseRepository<ACA_SE_VERSION_PREGUNTATable>, IACA_SE_VERSION_PREGUNTARepository
	{
		private const string _TableName = "ACA_SE_VERSION_PREGUNTA";
		private const string _ViewName = "V_ACA_SE_VERSION_PREGUNTA";
		private const string _CampoPk = "CORR_VERSION_PREGUNTA";
		private const string _CampoEstado = "ACTIVO";
		private const bool _UsaEmpresa = false;

		public ACA_SE_VERSION_PREGUNTARepository(IConfiguration config) :
			base(config.GetConnectionString("defaultConnection"),
				config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_VERSION)
					.ThenBy(x => x.CORR_SECCION_SE ?? 0)
					.ThenBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_PREGUNTA)
					.ToList();
				reader.Close();
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
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, xWhere);
				var response = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_VERSION_PREGUNTA ?? 0;
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
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> CreateAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var validacion = await ValidarSeccionDeVersionAsync(Data.CORR_VERSION, Data.CORR_SECCION_SE);
				if (!validacion.Result)
					return validacion;

				// Qué hace: puntaje solo aplica a secciones PREGUNTA; en RANGO_MONTO queda 0.
				Data.PUNTAJE = NormalizarPuntajePorSeccion(validacion, Data.PUNTAJE);

				// Qué hace: inserta sin CORR_VERSION_PREGUNTA porque la PK es IDENTITY.
				// Cómo lo hace: Insert sin CampoPk y relee por versión+pregunta (UQ).
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA", Value = Data.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "PUNTAJE", Value = Data.PUNTAJE, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ES_REQUERIDO", Value = Data.ES_REQUERIDO ?? false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA", Value = Data.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Insert(_TableName, p, string.Empty, pWhere);
				var inserted = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				var corr = inserted?.CORR_VERSION_PREGUNTA ?? 0;
				var response = corr > 0 ? await LeerVistaPorPkAsync(corr) : inserted;
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_VERSION_PREGUNTA ?? corr;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var dup = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = dup ? 2627 : -1;
				objResultado.ErrorMessage = dup
					? "Ya existe esa pregunta en la versión seleccionada."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var validacion = await ValidarSeccionDeVersionAsync(Data.CORR_VERSION, Data.CORR_SECCION_SE);
				if (!validacion.Result)
					return validacion;

				Data.PUNTAJE = NormalizarPuntajePorSeccion(validacion, Data.PUNTAJE);

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA", Value = Data.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "PUNTAJE", Value = Data.PUNTAJE, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ES_REQUERIDO", Value = Data.ES_REQUERIDO ?? false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION_PREGUNTA", Value = Data.CORR_VERSION_PREGUNTA, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				reader.Close();
				var response = await LeerVistaPorPkAsync(Data.CORR_VERSION_PREGUNTA);
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_VERSION_PREGUNTA ?? Data.CORR_VERSION_PREGUNTA;
				objResultado.ErrorCode = 0;
				objResultado.ErrorMessage = "";
				objResultado.ErrorSource = "";
			}
			catch (Exception e)
			{
				var dup = IsDuplicateKeyError(e);
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = 0;
				objResultado.ErrorCode = dup ? 2627 : -1;
				objResultado.ErrorMessage = dup
					? "Ya existe esa pregunta en la versión seleccionada."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION_PREGUNTA", Value = Data.CORR_VERSION_PREGUNTA, DbType = System.Data.DbType.Int32 },
				};
				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_VERSION_PREGUNTA;
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
				objResultado.ErrorMessage = "No se puede eliminar el registro porque tiene datos asociados.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> ActivarInactivarAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = 0, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_VERSION_PREGUNTA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var response = await LeerVistaPorPkAsync(Data.CORR_VERSION_PREGUNTA);
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_VERSION_PREGUNTA ?? Data.CORR_VERSION_PREGUNTA;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_VERSION_PREGUNTA;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Update)";
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = Data.CORR_VERSION_PREGUNTA;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		private async Task<ACA_SE_VERSION_PREGUNTAView> LeerVistaPorPkAsync(int corr)
		{
			var xWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION_PREGUNTA", Value = corr, DbType = System.Data.DbType.Int32 },
			};
			var readerGet = await objData.GetDataReader(_ViewName, xWhere);
			var response = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(readerGet).FirstOrDefault();
			readerGet.Close();
			return response;
		}

		// Qué hace: exige sección y que pertenezca a la versión elegida.
		// Cómo lo hace: lee V_ACA_SE_SECCION por PK y compara CORR_VERSION; deja TIPO_EVALUACION en Data.
		private async Task<CResult> ValidarSeccionDeVersionAsync(int corrVersion, int? corrSeccion)
		{
			var ok = new CResult { Result = true, ErrorCode = 0, ErrorMessage = "", Data = null };
			if (!corrSeccion.HasValue || corrSeccion.Value <= 0)
			{
				ok.Result = false;
				ok.ErrorCode = 4004;
				ok.ErrorMessage = "Debe seleccionar la sección de la versión.";
				return ok;
			}

			var reader = await objData.GetDataReader("V_ACA_SE_SECCION", new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_SECCION_SE", Value = corrSeccion.Value, DbType = System.Data.DbType.Int32 },
			});
			var seccion = new List<ACA_SE_SECCIONView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();

			if (seccion == null)
			{
				ok.Result = false;
				ok.ErrorCode = 4005;
				ok.ErrorMessage = "La sección seleccionada no existe.";
				return ok;
			}

			if (seccion.CORR_VERSION != corrVersion)
			{
				ok.Result = false;
				ok.ErrorCode = 4006;
				ok.ErrorMessage = "La sección no pertenece a la versión seleccionada.";
				return ok;
			}

			ok.Data = seccion;
			return ok;
		}

		// Qué hace: si la sección no es PREGUNTA, el puntaje de la pregunta queda en 0.
		// Cómo lo hace: lee TIPO_EVALUACION del Data de la validación; PUNTAJE < 0 → 0.
		private static decimal NormalizarPuntajePorSeccion(CResult validacion, decimal puntaje)
		{
			var seccion = validacion?.Data as ACA_SE_SECCIONView;
			var esPregunta = seccion != null &&
				string.Equals(seccion.TIPO_EVALUACION, "PREGUNTA", StringComparison.OrdinalIgnoreCase);
			if (!esPregunta)
				return 0m;
			return puntaje < 0 ? 0m : puntaje;
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
		}
	}
}
