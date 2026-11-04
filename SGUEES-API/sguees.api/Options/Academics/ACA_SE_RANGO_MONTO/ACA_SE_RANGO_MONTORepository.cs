// Qué hace: persistencia SQL del catálogo rangos de monto SE.
// Cómo lo hace: CRUD y ActivarInactivar; solo permite secciones TIPO_EVALUACION=RANGO_MONTO.
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
	public class ACA_SE_RANGO_MONTORepository : BaseRepository<ACA_SE_RANGO_MONTOTable>, IACA_SE_RANGO_MONTORepository
	{
		private const string _TableName = "ACA_SE_RANGO_MONTO";
		private const string _ViewName = "V_ACA_SE_RANGO_MONTO";
		private const string _CampoPk = "CORR_RANGO_MONTO";
		private const string _CampoEstado = "ACTIVO";
		private const bool _UsaEmpresa = false;
		private const string _ViewSeccion = "V_ACA_SE_SECCION";

		public ACA_SE_RANGO_MONTORepository(IConfiguration config) :
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
				var response = new List<ACA_SE_RANGO_MONTOView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_VERSION)
					.ThenBy(x => x.CORR_SECCION_SE)
					.ThenBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_RANGO_MONTO)
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
				var response = new List<ACA_SE_RANGO_MONTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.CodeHelper = response?.CORR_RANGO_MONTO ?? 0;
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

		public async Task<CResult> CreateAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var validacion = await ValidarNegocioAsync(Data);
				if (!validacion.Result)
					return validacion;

				// Qué hace: inserta sin CORR_RANGO_MONTO porque la PK es IDENTITY.
				// Cómo lo hace: Insert sin CampoPk y relee por sección+descripción+orden.
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "PUNTAJE", Value = Data.PUNTAJE, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "RANGO_INICIAL", Value = Data.RANGO_INICIAL, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "RANGO_FINAL", Value = Data.RANGO_FINAL, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "ACTIVO", Value = Data.ACTIVO ?? true, DbType = System.Data.DbType.Boolean },
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA > 0 ? Data.CORR_EMPRESA : 1, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Insert(_TableName, p, string.Empty, pWhere);
				var inserted = new List<ACA_SE_RANGO_MONTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				var corr = inserted?.CORR_RANGO_MONTO ?? 0;
				var response = corr > 0 ? await LeerVistaPorPkAsync(corr) : inserted;
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_RANGO_MONTO ?? corr;
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

		public async Task<CResult> UpdateAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var validacion = await ValidarNegocioAsync(Data);
				if (!validacion.Result)
					return validacion;

				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_VERSION", Value = Data.CORR_VERSION, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "DESCRIPCION", Value = Data.DESCRIPCION, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "PUNTAJE", Value = Data.PUNTAJE, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "RANGO_INICIAL", Value = Data.RANGO_INICIAL, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "RANGO_FINAL", Value = Data.RANGO_FINAL, DbType = System.Data.DbType.Decimal },
					new CParameter() { ParameterName = "ORDEN", Value = Data.ORDEN, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_RANGO_MONTO", Value = Data.CORR_RANGO_MONTO, DbType = System.Data.DbType.Int32 },
				};
				var reader = await objData.Update(_TableName, p, pWhere);
				reader.Close();
				var response = await LeerVistaPorPkAsync(Data.CORR_RANGO_MONTO);
				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_RANGO_MONTO ?? Data.CORR_RANGO_MONTO;
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

		public async Task<CResult> DeleteAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();
			try
			{
				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_RANGO_MONTO", Value = Data.CORR_RANGO_MONTO, DbType = System.Data.DbType.Int32 },
				};
				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Data = null;
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_RANGO_MONTO;
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
				objResultado.ErrorMessage = "No se puede eliminar el rango porque tiene registros asociados en otras tablas.";
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		public async Task<CResult> ActivarInactivarAsync(ACA_SE_RANGO_MONTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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
					new CParameter() { ParameterName = "CORR_RELATIVO", Value = Data.CORR_RANGO_MONTO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "@SYS_LOGIN_USUARIO", Value = vLOGIN_SISTEMA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_ESTACION", Value = vESTACION ?? string.Empty, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "@SYS_FILAS_AFECTADAS", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_NUMERO_ERROR", Value = 0, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "@SYS_MENSAJE_ERROR", Value = string.Empty, DbType = System.Data.DbType.String, Direction = System.Data.ParameterDirection.InputOutput, Size = 4000 },
				};
				await objData.ExecCmd(System.Data.CommandType.StoredProcedure, "PRAL_MTTO_CATALOGO_ESTADO_BIT", true, p);
				if ((int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value == 0)
				{
					var response = await LeerVistaPorPkAsync(Data.CORR_RANGO_MONTO);
					objResultado.Data = response;
					objResultado.Result = true;
					objResultado.RowsAffected = 1;
					objResultado.CodeHelper = response?.CORR_RANGO_MONTO ?? Data.CORR_RANGO_MONTO;
					objResultado.ErrorCode = 0;
					objResultado.ErrorMessage = string.Empty;
					objResultado.ErrorSource = string.Empty;
				}
				else
				{
					objResultado.Data = null;
					objResultado.Result = false;
					objResultado.RowsAffected = 0;
					objResultado.CodeHelper = Data.CORR_RANGO_MONTO;
					objResultado.ErrorCode = (int)objData.objCommand.Parameters["@SYS_NUMERO_ERROR"].Value;
					objResultado.ErrorMessage = (string)objData.objCommand.Parameters["@SYS_MENSAJE_ERROR"].Value;
					objResultado.ErrorSource = "C" + _TableName + ".Mtto(Update)";
				}
			}
			catch (Exception e)
			{
				objResultado.Data = null;
				objResultado.Result = false;
				objResultado.CodeHelper = Data.CORR_RANGO_MONTO;
				objResultado.ErrorCode = -1;
				objResultado.ErrorMessage = e.Message;
				objResultado.ErrorSource += $"[{e.Source}]";
			}
			finally { objData.objConnection.Close(); }
			return objResultado;
		}

		// Qué hace: exige sección RANGO_MONTO de la misma versión y rangos coherentes.
		// Cómo lo hace: lee V_ACA_SE_SECCION y valida TIPO_EVALUACION + CORR_VERSION.
		private async Task<CResult> ValidarNegocioAsync(ACA_SE_RANGO_MONTOTable Data)
		{
			var ok = new CResult { Result = true, ErrorCode = 0, ErrorMessage = "" };

			if (Data.CORR_VERSION <= 0 || Data.CORR_SECCION_SE <= 0)
			{
				ok.Result = false;
				ok.ErrorCode = 4001;
				ok.ErrorMessage = "Debe indicar la versión y la sección.";
				return ok;
			}

			if (string.IsNullOrWhiteSpace(Data.DESCRIPCION))
			{
				ok.Result = false;
				ok.ErrorCode = 4002;
				ok.ErrorMessage = "Debe ingresar la descripción del rango.";
				return ok;
			}

			if (Data.RANGO_INICIAL > Data.RANGO_FINAL)
			{
				ok.Result = false;
				ok.ErrorCode = 4003;
				ok.ErrorMessage = "El rango inicial no puede ser mayor que el rango final.";
				return ok;
			}

			var reader = await objData.GetDataReader(_ViewSeccion, new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_SECCION_SE", Value = Data.CORR_SECCION_SE, DbType = System.Data.DbType.Int32 },
			});
			var seccion = new List<ACA_SE_SECCIONView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();

			if (seccion == null)
			{
				ok.Result = false;
				ok.ErrorCode = 4004;
				ok.ErrorMessage = "La sección seleccionada no existe.";
				return ok;
			}

			if (!string.Equals(seccion.TIPO_EVALUACION, "RANGO_MONTO", StringComparison.OrdinalIgnoreCase))
			{
				ok.Result = false;
				ok.ErrorCode = 4005;
				ok.ErrorMessage = "Solo puede asociar rangos a secciones de tipo RANGO_MONTO.";
				return ok;
			}

			if (seccion.CORR_VERSION != Data.CORR_VERSION)
			{
				ok.Result = false;
				ok.ErrorCode = 4006;
				ok.ErrorMessage = "La sección no pertenece a la versión seleccionada.";
				return ok;
			}

			return ok;
		}

		private async Task<ACA_SE_RANGO_MONTOView> LeerVistaPorPkAsync(int corr)
		{
			var xWhere = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_RANGO_MONTO", Value = corr, DbType = System.Data.DbType.Int32 },
			};
			var readerGet = await objData.GetDataReader(_ViewName, xWhere);
			var response = new List<ACA_SE_RANGO_MONTOView>().FromDataReader(readerGet).FirstOrDefault();
			readerGet.Close();
			return response;
		}
	}
}
