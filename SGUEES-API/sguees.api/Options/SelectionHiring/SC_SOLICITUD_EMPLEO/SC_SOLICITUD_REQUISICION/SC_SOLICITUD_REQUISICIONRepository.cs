using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using sguees.Models;

namespace sguees.Repositories
{
	public class SC_SOLICITUD_REQUISICIONRepository : BaseRepository<SC_SOLICITUD_REQUISICIONTable>, ISC_SOLICITUD_REQUISICIONRepository
	{
		private const string _TableName = "SC_SOLICITUD_REQUISICION";

		public SC_SOLICITUD_REQUISICIONRepository(IConfiguration config) :
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
				var response = new List<SC_SOLICITUD_REQUISICIONView>().FromDataReader(reader).ToList();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response.Count;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				SetError(objResultado, e);
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
				var response = new List<SC_SOLICITUD_REQUISICIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = response == null ? 0 : 1;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public async Task<CResult> CreateAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			if (Data.CORR_SOLICITUD_EMPLEO <= 0)
			{
				return ValidationResult(1001, "Debe guardar la solicitud de empleo antes de vincular requisiciones.");
			}

			if (Data.CORR_REQUISICION_PERSONAL <= 0)
			{
				return ValidationResult(1002, "Debe seleccionar una requisición de personal.");
			}

			if (await SolicitudYaAsociadaExpedienteAsync(Data.CORR_EMPRESA, Data.CORR_SOLICITUD_EMPLEO))
			{
				return ValidationResult(1004, "La solicitud ya está asociada al expediente; no se pueden agregar requisiciones (solo consulta).");
			}

			if (await ExistsVinculoAsync(Data.CORR_EMPRESA, Data.CORR_SOLICITUD_EMPLEO, Data.CORR_REQUISICION_PERSONAL))
			{
				return ValidationResult(1003, "La requisición seleccionada ya está vinculada a esta solicitud.");
			}

			try
			{
				var p = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SOLICITUD_REQUISICION", Value = Data.CORR_SOLICITUD_REQUISICION, DbType = System.Data.DbType.Int32, Direction = System.Data.ParameterDirection.InputOutput },
					new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = Data.CORR_SOLICITUD_EMPLEO, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = Data.CORR_REQUISICION_PERSONAL, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = System.Data.DbType.DateTime },
					new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = System.Data.DbType.String },
					new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = System.Data.DbType.DateTime },
				};

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				};

				var reader = await objData.Insert(_TableName, p, "CORR_SOLICITUD_REQUISICION", pWhere);
				var response = new List<SC_SOLICITUD_REQUISICIONView>().FromDataReader(reader).FirstOrDefault();

				reader.Close();
				reader = null;

				objResultado.Data = response;
				objResultado.Result = true;
				objResultado.RowsAffected = 1;
				objResultado.CodeHelper = response?.CORR_SOLICITUD_REQUISICION ?? 0;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		public Task<CResult> UpdateAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			throw new System.NotSupportedException("El vínculo solicitud-requisición no admite actualización.");
		}

		public async Task<CResult> DeleteAsync(SC_SOLICITUD_REQUISICIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			CResult objResultado = new();

			try
			{
				var vinculo = await GetVinculoByPkAsync(Data.CORR_EMPRESA, Data.CORR_SOLICITUD_REQUISICION);
				if (vinculo == null)
				{
					return ValidationResult(1005, "El vínculo de requisición no existe.");
				}

				if (await SolicitudYaAsociadaExpedienteAsync(vinculo.CORR_EMPRESA, vinculo.CORR_SOLICITUD_EMPLEO))
				{
					return ValidationResult(1004, "La solicitud ya está asociada al expediente; no se pueden quitar requisiciones (solo consulta).");
				}

				var cantidad = await ContarRequisicionesAsync(vinculo.CORR_EMPRESA, vinculo.CORR_SOLICITUD_EMPLEO);
				if (cantidad <= 1 && await SolicitudTieneLinkOPersonaAsync(vinculo.CORR_EMPRESA, vinculo.CORR_SOLICITUD_EMPLEO))
				{
					return ValidationResult(
						1006,
						"Después de generar el enlace debe mantener al menos una requisición. Vincule otra (reemplazo) antes de quitar esta.");
				}

				var pWhere = new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
					new CParameter() { ParameterName = "CORR_SOLICITUD_REQUISICION", Value = Data.CORR_SOLICITUD_REQUISICION, DbType = System.Data.DbType.Int32 },
				};

				objResultado.RowsAffected = (int)await objData.Delete(_TableName, pWhere);
				objResultado.Result = true;
				objResultado.CodeHelper = Data.CORR_SOLICITUD_REQUISICION;
				objResultado.ErrorCode = 0;
			}
			catch (System.Exception e)
			{
				SetError(objResultado, e);
			}
			finally
			{
				objData.objConnection.Close();
			}

			return objResultado;
		}

		private async Task<SC_SOLICITUD_REQUISICIONView> GetVinculoByPkAsync(int corrEmpresa, int corrSolicitudRequisicion)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_REQUISICION", Value = corrSolicitudRequisicion, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader("V_" + _TableName, p);
			var row = new List<SC_SOLICITUD_REQUISICIONView>().FromDataReader(reader).FirstOrDefault();
			reader.Close();
			objData.objConnection.Close();
			return row;
		}

		private async Task<int> ContarRequisicionesAsync(int corrEmpresa, int corrSolicitudEmpleo)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader("V_" + _TableName, p);
			var rows = new List<SC_SOLICITUD_REQUISICIONView>().FromDataReader(reader).ToList();
			reader.Close();
			objData.objConnection.Close();
			return rows.Count;
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

		private async Task<bool> SolicitudTieneLinkOPersonaAsync(int corrEmpresa, int corrSolicitudEmpleo)
		{
			var pSolicitud = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
			};

			var readerSolicitud = await objData.GetDataReader("V_SC_SOLICITUD_EMPLEO", pSolicitud);
			var solicitud = new List<SC_SOLICITUD_EMPLEOView>().FromDataReader(readerSolicitud).FirstOrDefault();
			readerSolicitud.Close();
			objData.objConnection.Close();

			if (solicitud != null && (solicitud.CORR_PERSONA_DATOS ?? 0) > 0)
			{
				return true;
			}

			var readerToken = await objData.GetDataReader("SC_SOLICITUD_EMPLEO_TOKEN", pSolicitud);
			var tieneToken = readerToken.HasRows;
			while (readerToken.Read()) { /* drain */ }
			readerToken.Close();
			objData.objConnection.Close();
			return tieneToken;
		}

		private async Task<bool> ExistsVinculoAsync(int corrEmpresa, int corrSolicitudEmpleo, int corrRequisicionPersonal)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SOLICITUD_EMPLEO", Value = corrSolicitudEmpleo, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_REQUISICION_PERSONAL", Value = corrRequisicionPersonal, DbType = System.Data.DbType.Int32 },
			};

			var reader = await objData.GetDataReader("V_" + _TableName, p);
			var rows = new List<SC_SOLICITUD_REQUISICIONView>().FromDataReader(reader).ToList();
			reader.Close();
			objData.objConnection.Close();
			return rows.Count > 0;
		}

		private static void SetError(CResult result, System.Exception ex)
		{
			result.Data = null;
			result.Result = false;
			result.ErrorCode = -1;
			result.ErrorMessage = ex.Message;
			result.ErrorSource = $"[{ex.Source}]";
		}

		private static CResult ValidationResult(int errorCode, string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = errorCode,
				ErrorMessage = message,
				ErrorSource = "[SC_SOLICITUD_REQUISICIONRepository]",
			};
		}
	}
}
