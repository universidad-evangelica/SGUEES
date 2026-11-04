// Qué hace: persistencia SQL de secciones SE por versión.
// Cómo lo hace: CRUD/ActivarInactivar sobre ACA_SE_SECCION / V_ACA_SE_SECCION;
//               valida que la suma de % de secciones activas de la versión no pase 100.
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
	public class ACA_SE_SECCIONRepository : BaseRepository<ACA_SE_SECCIONTable>, IACA_SE_SECCIONRepository
	{
		private const string _TableName = "ACA_SE_SECCION";
		private const string _ViewName = "V_ACA_SE_SECCION";
		private const string _CampoPk = "CORR_SECCION_SE";
		private const string _CampoEstado = "ACTIVO";
		private const bool _UsaEmpresa = false;

		public ACA_SE_SECCIONRepository(IConfiguration config) :
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
				var response = new List<ACA_SE_SECCIONView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_VERSION)
					.ThenBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_SECCION_SE)
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
				var response = new List<ACA_SE_SECCIONView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_SECCION_SE ?? 0;
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

		public async Task<CResult> CreateAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var validacion = await ValidarPorcentajeAsync(
					Data.CORR_VERSION,
					0,
					Data.PORCENTAJE_MAXIMO,
					Data.ACTIVO ?? true);
				if (!validacion.Result)
					return validacion;

				// Qué hace: inserta sin CORR_SECCION_SE porque la PK es IDENTITY.
				// Cómo lo hace: Insert sin CampoPk (evita MAX+1/valor explícito) y relee por versión+código (UQ).
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CODIGO", Value = Data.CODIGO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_SECCION", Value = Data.NOMBRE_SECCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "DESCRIPCION", Value = (object)Data.DESCRIPCION ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "PORCENTAJE_MAXIMO", Value = Data.PORCENTAJE_MAXIMO, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA <= 0 ? 1 : Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
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
					new CParameter() { ParameterName = "CODIGO", Value = Data.CODIGO, DbType = System.Data.DbType.String },
				};
				var reader = await objData.Insert(_TableName, p, string.Empty, pWhere);
				var inserted = new List<ACA_SE_SECCIONView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				var corr = inserted?.CORR_SECCION_SE ?? 0;
				var response = corr > 0 ? await LeerVistaPorPkAsync(corr) : inserted;
				objResultado.Data = response ?? inserted;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_SECCION_SE ?? corr;
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
					? "Ya existe una sección con ese código en la versión."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> UpdateAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var actual = await LeerVistaPorPkAsync(Data.CORR_SECCION_SE);
				var activo = Data.ACTIVO ?? actual?.ACTIVO ?? true;
				var validacion = await ValidarPorcentajeAsync(
					Data.CORR_VERSION,
					Data.CORR_SECCION_SE,
					Data.PORCENTAJE_MAXIMO,
					activo == true);
				if (!validacion.Result)
					return validacion;

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CODIGO", Value = Data.CODIGO, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "NOMBRE_SECCION", Value = Data.NOMBRE_SECCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "DESCRIPCION", Value = (object)Data.DESCRIPCION ?? DBNull.Value, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "PORCENTAJE_MAXIMO", Value = Data.PORCENTAJE_MAXIMO, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				reader.Close();
				var response = await LeerVistaPorPkAsync(Data.CORR_SECCION_SE);
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_SECCION_SE ?? Data.CORR_SECCION_SE;
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
					? "Ya existe una sección con ese código en la versión."
					: e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> DeleteAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
				};
				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_SECCION_SE;
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
				objResultado.ErrorMessage = "No se puede eliminar la sección porque tiene registros asociados.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> ActivarInactivarAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var actual = await LeerVistaPorPkAsync(Data.CORR_SECCION_SE);
				if (actual == null)
				{
					objResultado.Result = false;
					objResultado.ErrorCode = 404;
					objResultado.ErrorMessage = "No se encontró la sección.";
					return objResultado;
				}

				// Qué hace: si va a activar, valida que no se pase del 100% con las demás activas.
				var quedaraActiva = !(actual.ACTIVO == true);
				if (quedaraActiva)
				{
					var validacion = await ValidarPorcentajeAsync(
						actual.CORR_VERSION,
						actual.CORR_SECCION_SE,
						actual.PORCENTAJE_MAXIMO,
						true,
						"activar");
					if (!validacion.Result)
						return validacion;
				}

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "NOMBRE_TABLA", Value = _TableName, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_PK", Value = _CampoPk, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "CAMPO_ESTADO", Value = _CampoEstado, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "USA_EMPRESA", Value = _UsaEmpresa, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = 0, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var response = await LeerVistaPorPkAsync(Data.CORR_SECCION_SE);
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_SECCION_SE ?? Data.CORR_SECCION_SE;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_SECCION_SE;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Update)";
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = Data.CORR_SECCION_SE;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		// Qué hace: lista secciones para GetLookUp de preguntas por versión.
		// Cómo lo hace: lee V_ACA_SE_SECCION completa (el SPA filtra por CORR_VERSION).
		public async Task<CResult> GetSeccionesLookUpAsync()
		{
			CResult objResultado = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewName, new List<CParameter>());
				var response = new List<ACA_SE_SECCIONView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_VERSION)
					.ThenBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_SECCION_SE)
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

		// Qué hace: impide que las secciones activas de una versión sumen más de 100%.
		// Cómo lo hace: suma PORCENTAJE_MAXIMO de activas (excluye la fila en edición) + el nuevo valor.
		private async Task<CResult> ValidarPorcentajeAsync(
			int corrVersion,
			int corrExcluir,
			decimal porcentajeNuevo,
			bool activoNuevo,
			string contexto = "guardar")
		{
			var ok = new CResult { Result = true, ErrorCode = 0, ErrorMessage = "" };
			if (!activoNuevo)
				return ok;

			if (porcentajeNuevo < 0 || porcentajeNuevo > 100)
			{
				ok.Result = false;
				ok.ErrorCode = 4001;
				ok.ErrorMessage = "El porcentaje máximo debe estar entre 0 y 100.";
				return ok;
			}

			var reader = await objData.GetDataReader(_ViewName, new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION", Value = corrVersion, DbType = System.Data.DbType.Int32 },
			});
			var lista = new List<ACA_SE_SECCIONView>().FromDataReader(reader).ToList();
			reader.Close();

			var sumaOtras = lista
				.Where(x => x.ACTIVO == true && x.CORR_SECCION_SE != corrExcluir)
				.Sum(x => x.PORCENTAJE_MAXIMO);
			var esActivar = string.Equals(contexto, "activar", StringComparison.OrdinalIgnoreCase);

			if (sumaOtras >= 100m)
			{
				ok.Result = false;
				ok.ErrorCode = 4002;
				ok.ErrorMessage = esActivar
					? $"No puede activar esta sección porque ya hay secciones activas que suman el 100% ({sumaOtras:0.##}%). Desactive alguna o reduzca su % máximo para liberar porcentaje."
					: $"Las secciones activas de esta versión ya suman {sumaOtras:0.##}%. No puede agregar otra hasta liberar porcentaje.";
				return ok;
			}

			if (sumaOtras + porcentajeNuevo > 100m)
			{
				var disponible = 100m - sumaOtras;
				ok.Result = false;
				ok.ErrorCode = 4003;
				ok.ErrorMessage = esActivar
					? $"No puede activar esta sección ({porcentajeNuevo:0.##}%): solo hay {disponible:0.##}% disponible porque las activas ya usan {sumaOtras:0.##}%."
					: $"El porcentaje supera el 100% de la versión. Disponible: {disponible:0.##}% (ya usados {sumaOtras:0.##}%).";
				return ok;
			}

			return ok;
		}

		private async Task<ACA_SE_SECCIONView> LeerVistaPorPkAsync(int corr)
		{
			var xWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_SECCION_SE", Value = corr, DbType = System.Data.DbType.Int32 },
			};
			var readerGet = await objData.GetDataReader(_ViewName, xWhere);
			var response = new List<ACA_SE_SECCIONView>().FromDataReader(readerGet).FirstOrDefault();
			readerGet.Close();
			return response;
		}

		private static bool IsDuplicateKeyError(Exception e)
		{
			return e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase) ||
				e.Message.Contains("UQ_ACA_SE_SECCION", StringComparison.OrdinalIgnoreCase);
		}
	}
}
