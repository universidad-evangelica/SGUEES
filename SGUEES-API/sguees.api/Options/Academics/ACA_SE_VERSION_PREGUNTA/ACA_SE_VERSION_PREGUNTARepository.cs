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

				// Qué hace: puntaje en pregunta salvo RANGO_MONTO u OPCION_UNICA (esa usa puntaje de opción).
				Data.PUNTAJE = await NormalizarPuntajePreguntaAsync(validacion, Data.CORR_PREGUNTA, Data.PUNTAJE);

				var topeOk = await ValidarPuntajeVsTopeSeccionAsync(
					Data.CORR_VERSION,
					Data.CORR_SECCION_SE,
					excluirCorrVersionPregunta: null,
					Data.CORR_PREGUNTA,
					Data.PUNTAJE,
					validacion.Data as ACA_SE_SECCIONView);
				if (!topeOk.Result)
					return topeOk;

				var rolOk = await NormalizarYValidarRolMontoAsync(Data, validacion);
				if (!rolOk.Result)
					return rolOk;

				var unica = await ValidarPreguntaUnicaEnSeccionAsync(
					Data.CORR_VERSION,
					Data.CORR_SECCION_SE,
					Data.CORR_PREGUNTA,
					excluirCorrVersionPregunta: null);
				if (!unica.Result)
					return unica;

				// Qué hace: inserta sin CORR_VERSION_PREGUNTA porque la PK es IDENTITY.
				// Cómo lo hace: Insert sin CampoPk y relee por versión+sección+pregunta (UQ).
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA", Value = Data.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "PUNTAJE", Value = Data.PUNTAJE, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ES_REQUERIDO", Value = Data.ES_REQUERIDO ?? false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "ROL_MONTO", Value = (object)Data.ROL_MONTO ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_PREGUNTA_BRUTO", Value = (object)Data.CORR_PREGUNTA_BRUTO ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA_DESCUENTO", Value = (object)Data.CORR_PREGUNTA_DESCUENTO ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
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
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
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
				objResultado.ErrorMessage = MensajeErrorPersistencia(e, dup);
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

				Data.PUNTAJE = await NormalizarPuntajePreguntaAsync(validacion, Data.CORR_PREGUNTA, Data.PUNTAJE);

				var topeOk = await ValidarPuntajeVsTopeSeccionAsync(
					Data.CORR_VERSION,
					Data.CORR_SECCION_SE,
					excluirCorrVersionPregunta: Data.CORR_VERSION_PREGUNTA,
					Data.CORR_PREGUNTA,
					Data.PUNTAJE,
					validacion.Data as ACA_SE_SECCIONView);
				if (!topeOk.Result)
					return topeOk;

				var rolOk = await NormalizarYValidarRolMontoAsync(Data, validacion);
				if (!rolOk.Result)
					return rolOk;

				var unica = await ValidarPreguntaUnicaEnSeccionAsync(
					Data.CORR_VERSION,
					Data.CORR_SECCION_SE,
					Data.CORR_PREGUNTA,
					excluirCorrVersionPregunta: Data.CORR_VERSION_PREGUNTA);
				if (!unica.Result)
					return unica;

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA", Value = Data.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "PUNTAJE", Value = Data.PUNTAJE, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ES_REQUERIDO", Value = Data.ES_REQUERIDO ?? false, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "ROL_MONTO", Value = (object)Data.ROL_MONTO ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CORR_PREGUNTA_BRUTO", Value = (object)Data.CORR_PREGUNTA_BRUTO ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PREGUNTA_DESCUENTO", Value = (object)Data.CORR_PREGUNTA_DESCUENTO ?? DBNull.Value, DbType = System.Data.DbType.Int32 },
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
				objResultado.ErrorMessage = MensajeErrorPersistencia(e, dup);
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

		// Qué hace: no permite la misma pregunta dos veces en la misma versión+sección.
		// Cómo lo hace: busca en la vista otra fila con esos tres campos (excluye la PK en update).
		private async Task<CResult> ValidarPreguntaUnicaEnSeccionAsync(
			int corrVersion,
			int? corrSeccion,
			int corrPregunta,
			int? excluirCorrVersionPregunta)
		{
			var ok = new CResult { Result = true, ErrorCode = 0, ErrorMessage = "" };
			if (corrVersion <= 0 || !corrSeccion.HasValue || corrSeccion.Value <= 0 || corrPregunta <= 0)
				return ok;

			var reader = await objData.GetDataReader(_ViewName, new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION", Value = corrVersion, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SECCION_SE", Value = corrSeccion.Value, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PREGUNTA", Value = corrPregunta, DbType = System.Data.DbType.Int32 },
			});
			var lista = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(reader).ToList();
			reader.Close();

			var otra = lista.FirstOrDefault(x =>
				!excluirCorrVersionPregunta.HasValue ||
				excluirCorrVersionPregunta.Value <= 0 ||
				x.CORR_VERSION_PREGUNTA != excluirCorrVersionPregunta.Value);

			if (otra != null)
			{
				ok.Result = false;
				ok.ErrorCode = 2627;
				ok.ErrorMessage = "Ya existe esa pregunta en la versión y sección seleccionadas.";
			}

			return ok;
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

		// Qué hace: puntaje de pregunta solo en sección PREGUNTA y si el tipo NO es OPCION_UNICA.
		// Cómo lo hace: RANGO_MONTO u OPCION_UNICA → 0; el puntaje de única va en ACA_SE_OPCION.
		private async Task<decimal> NormalizarPuntajePreguntaAsync(CResult validacion, int corrPregunta, decimal puntaje)
		{
			var seccion = validacion?.Data as ACA_SE_SECCIONView;
			var esSeccionPregunta = seccion != null &&
				string.Equals(seccion.TIPO_EVALUACION, "PREGUNTA", StringComparison.OrdinalIgnoreCase);
			if (!esSeccionPregunta)
				return 0m;

			var reader = await objData.GetDataReader("V_ACA_SE_PREGUNTA", new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PREGUNTA", Value = corrPregunta, DbType = System.Data.DbType.Int32 },
			});
			var pregunta = new List<ACA_SE_PREGUNTAView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();

			if (pregunta != null &&
				string.Equals(pregunta.CODIGO_TIPO_PREGUNTA, "OPCION_UNICA", StringComparison.OrdinalIgnoreCase))
				return 0m;

			return puntaje < 0 ? 0m : puntaje;
		}

		// Qué hace: impide que la capacidad de puntaje de la sección PREGUNTA pase el PORCENTAJE_MAXIMO.
		// Cómo lo hace: OPCION_UNICA aporta MAX(opciones); el resto aporta PUNTAJE; suma hermanas + aporte actual ≤ tope.
		private async Task<CResult> ValidarPuntajeVsTopeSeccionAsync(
			int corrVersion,
			int? corrSeccion,
			int? excluirCorrVersionPregunta,
			int corrPreguntaActual,
			decimal puntajeNuevo,
			ACA_SE_SECCIONView seccion)
		{
			var ok = new CResult { Result = true, ErrorCode = 0, ErrorMessage = "" };
			if (seccion == null ||
				!string.Equals(seccion.TIPO_EVALUACION, "PREGUNTA", StringComparison.OrdinalIgnoreCase) ||
				!corrSeccion.HasValue ||
				corrSeccion.Value <= 0)
				return ok;

			var tope = seccion.PORCENTAJE_MAXIMO;
			if (tope < 0)
				tope = 0;

			var reader = await objData.GetDataReader(_ViewName, new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION", Value = corrVersion, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SECCION_SE", Value = corrSeccion.Value, DbType = System.Data.DbType.Int32 },
			});
			var hermanas = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(reader).ToList();
			reader.Close();

			var excluir = excluirCorrVersionPregunta ?? 0;
			decimal sumaOtros = 0m;
			foreach (var h in hermanas.Where(x => x.CORR_VERSION_PREGUNTA != excluir))
			{
				sumaOtros += await ObtenerAporteCapacidadAsync(
					h.CORR_PREGUNTA,
					h.CODIGO_TIPO_PREGUNTA,
					h.PUNTAJE);
			}

			var tipoActual = hermanas.FirstOrDefault(x => x.CORR_PREGUNTA == corrPreguntaActual)?.CODIGO_TIPO_PREGUNTA;
			if (string.IsNullOrWhiteSpace(tipoActual))
			{
				var readerPreg = await objData.GetDataReader("V_ACA_SE_PREGUNTA", new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_PREGUNTA", Value = corrPreguntaActual, DbType = System.Data.DbType.Int32 },
				});
				var preg = new List<ACA_SE_PREGUNTAView>().FromDataReader(readerPreg).FirstOrDefault();
				readerPreg.Close();
				tipoActual = preg?.CODIGO_TIPO_PREGUNTA;
			}

			var aporteActual = await ObtenerAporteCapacidadAsync(corrPreguntaActual, tipoActual, puntajeNuevo);
			var total = sumaOtros + aporteActual;

			if (total > tope)
			{
				var disponible = tope - sumaOtros;
				if (disponible < 0)
					disponible = 0;
				ok.Result = false;
				ok.ErrorCode = 4016;
				ok.ErrorMessage = disponible <= 0
					? $"El máximo de la sección ({tope:0.##}) ya está cubierto por selección única u otras preguntas " +
					  $"(reservado: {sumaOtros:0.##}). Disponible: 0."
					: $"El puntaje supera el máximo de la sección ({tope:0.##}). " +
					  $"Ya reservado en otras preguntas: {sumaOtros:0.##}. Disponible: {disponible:0.##}.";
			}

			return ok;
		}

		// Qué hace: capacidad de una pregunta para el tope de sección.
		// Cómo lo hace: OPCION_UNICA → MAX(PUNTAJE de opciones); resto → PUNTAJE de versión-pregunta.
		private async Task<decimal> ObtenerAporteCapacidadAsync(int corrPregunta, string codigoTipo, decimal puntajeVp)
		{
			if (string.Equals(codigoTipo, "OPCION_UNICA", StringComparison.OrdinalIgnoreCase))
				return await ObtenerMaxPuntajeOpcionesAsync(corrPregunta, excluirCorrOpcion: null, puntajeOpcionOverride: null);

			return puntajeVp < 0 ? 0m : puntajeVp;
		}

		// Qué hace: máximo puntaje entre opciones de una pregunta (capacidad de selección única).
		// Cómo lo hace: lee V_ACA_SE_OPCION; permite excluir/sustituir una opción en edición.
		private async Task<decimal> ObtenerMaxPuntajeOpcionesAsync(
			int corrPregunta,
			int? excluirCorrOpcion,
			decimal? puntajeOpcionOverride)
		{
			var reader = await objData.GetDataReader("V_ACA_SE_OPCION", new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PREGUNTA", Value = corrPregunta, DbType = System.Data.DbType.Int32 },
			});
			var opciones = new List<ACA_SE_OPCIONView>().FromDataReader(reader).ToList();
			reader.Close();

			decimal max = 0m;
			var excluir = excluirCorrOpcion ?? 0;
			foreach (var o in opciones)
			{
				if (o.CORR_OPCION == excluir)
					continue;
				var pts = o.PUNTAJE < 0 ? 0m : o.PUNTAJE;
				if (pts > max)
					max = pts;
			}

			if (puntajeOpcionOverride.HasValue)
			{
				var pts = puntajeOpcionOverride.Value < 0 ? 0m : puntajeOpcionOverride.Value;
				if (pts > max)
					max = pts;
			}

			return max;
		}

		// Qué hace: ROL_MONTO/asoc. solo si sección RANGO_MONTO y pregunta tipo MONTO; si LIQUIDO exige bruto+descuento de la misma versión+sección.
		private async Task<CResult> NormalizarYValidarRolMontoAsync(ACA_SE_VERSION_PREGUNTATable Data, CResult validacionSeccion)
		{
			var ok = new CResult { Result = true, ErrorCode = 0, ErrorMessage = "" };
			var seccion = validacionSeccion?.Data as ACA_SE_SECCIONView;
			var esRangoMonto = seccion != null &&
				string.Equals(seccion.TIPO_EVALUACION, "RANGO_MONTO", StringComparison.OrdinalIgnoreCase);

			var reader = await objData.GetDataReader("V_ACA_SE_PREGUNTA", new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PREGUNTA", Value = Data.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
			});
			var pregunta = new List<ACA_SE_PREGUNTAView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();

			var esTipoMonto = pregunta != null &&
				string.Equals(pregunta.CODIGO_TIPO_PREGUNTA, "MONTO", StringComparison.OrdinalIgnoreCase);

			if (!esRangoMonto || !esTipoMonto)
			{
				Data.ROL_MONTO = null;
				Data.CORR_PREGUNTA_BRUTO = null;
				Data.CORR_PREGUNTA_DESCUENTO = null;
				return ok;
			}

			if (string.IsNullOrWhiteSpace(Data.ROL_MONTO))
			{
				ok.Result = false;
				ok.ErrorCode = 4010;
				ok.ErrorMessage = "Debe seleccionar el rol de monto (Bruto, Descuento, Líquido o Monto).";
				return ok;
			}

			Data.ROL_MONTO = Data.ROL_MONTO.Trim().ToUpperInvariant();
			var esLiquido = string.Equals(Data.ROL_MONTO, "LIQUIDO", StringComparison.OrdinalIgnoreCase);
			if (!esLiquido)
			{
				Data.CORR_PREGUNTA_BRUTO = null;
				Data.CORR_PREGUNTA_DESCUENTO = null;
				return ok;
			}

			if (!Data.CORR_PREGUNTA_BRUTO.HasValue || Data.CORR_PREGUNTA_BRUTO.Value <= 0 ||
				!Data.CORR_PREGUNTA_DESCUENTO.HasValue || Data.CORR_PREGUNTA_DESCUENTO.Value <= 0)
			{
				ok.Result = false;
				ok.ErrorCode = 4011;
				ok.ErrorMessage = "Si el rol es Líquido debe asociar la pregunta Bruto y la pregunta Descuento.";
				return ok;
			}

			if (Data.CORR_PREGUNTA_BRUTO == Data.CORR_PREGUNTA_DESCUENTO)
			{
				ok.Result = false;
				ok.ErrorCode = 4012;
				ok.ErrorMessage = "La pregunta Bruto y Descuento deben ser distintas.";
				return ok;
			}

			if (Data.CORR_PREGUNTA_BRUTO == Data.CORR_PREGUNTA || Data.CORR_PREGUNTA_DESCUENTO == Data.CORR_PREGUNTA)
			{
				ok.Result = false;
				ok.ErrorCode = 4013;
				ok.ErrorMessage = "Un líquido no puede asociarse a sí mismo.";
				return ok;
			}

			var hermanos = await objData.GetDataReader(_ViewName, new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
			});
			var lista = new List<ACA_SE_VERSION_PREGUNTAView>().FromDataReader(hermanos).ToList();
			hermanos.Close();

			var bruto = lista.FirstOrDefault(x => x.CORR_PREGUNTA == Data.CORR_PREGUNTA_BRUTO.Value);
			if (bruto == null || !string.Equals(bruto.ROL_MONTO, "BRUTO", StringComparison.OrdinalIgnoreCase))
			{
				ok.Result = false;
				ok.ErrorCode = 4014;
				ok.ErrorMessage = "La pregunta Bruto debe existir en la misma versión/sección con rol Bruto.";
				return ok;
			}

			var desc = lista.FirstOrDefault(x => x.CORR_PREGUNTA == Data.CORR_PREGUNTA_DESCUENTO.Value);
			if (desc == null || !string.Equals(desc.ROL_MONTO, "DESCUENTO", StringComparison.OrdinalIgnoreCase))
			{
				ok.Result = false;
				ok.ErrorCode = 4015;
				ok.ErrorMessage = "La pregunta Descuento debe existir en la misma versión/sección con rol Descuento.";
				return ok;
			}

			var conflictoBruto = lista.FirstOrDefault(x =>
				x.CORR_PREGUNTA_BRUTO == Data.CORR_PREGUNTA_BRUTO &&
				x.CORR_VERSION_PREGUNTA != Data.CORR_VERSION_PREGUNTA);
			if (conflictoBruto != null)
			{
				ok.Result = false;
				ok.ErrorCode = 4016;
				ok.ErrorMessage = $"Esa pregunta bruto ya está asociada al líquido {conflictoBruto.CODIGO_PREGUNTA}.";
				return ok;
			}

			var conflictoDesc = lista.FirstOrDefault(x =>
				x.CORR_PREGUNTA_DESCUENTO == Data.CORR_PREGUNTA_DESCUENTO &&
				x.CORR_VERSION_PREGUNTA != Data.CORR_VERSION_PREGUNTA);
			if (conflictoDesc != null)
			{
				ok.Result = false;
				ok.ErrorCode = 4017;
				ok.ErrorMessage = $"Esa pregunta descuento ya está asociada al líquido {conflictoDesc.CODIGO_PREGUNTA}.";
				return ok;
			}

			return ok;
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("unique index", StringComparison.OrdinalIgnoreCase);
		}

		private static string MensajeErrorPersistencia(Exception e, bool dup)
		{
			var msg = e.Message ?? string.Empty;
			if (msg.Contains("UQ_ACA_SE_VP_BRUTO_USO", StringComparison.OrdinalIgnoreCase))
				return "Esa pregunta bruto ya está asociada a otro líquido en esta sección.";
			if (msg.Contains("UQ_ACA_SE_VP_DESC_USO", StringComparison.OrdinalIgnoreCase))
				return "Esa pregunta descuento ya está asociada a otro líquido en esta sección.";
			if (dup)
				return "Ya existe esa pregunta en la versión y sección seleccionadas.";
			return msg;
		}
	}
}

