// Qué hace: acceso a datos de los documentos que se muestran en cada solicitud ACA_PROSPECTO.
// Cómo: lee las vistas de tipos y asignaciones, el catálogo ACA_DOCUMENTO_ADMISION, e inserta o elimina la relación.
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using Microsoft.Extensions.Configuration;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public class ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository
		: BaseRepository<ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable>, IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository
	{
		private const string _TableName = "ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTO";
		private const string _ViewAsignacion = "V_ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTO";
		private const string _ViewTipos = "V_ACA_FLUJO_TIPO_DOCUMENTO_PROSPECTO";
		private const string _TablaDocumentos = "ACA_DOCUMENTO_ADMISION";

		public ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository(IConfiguration config)
			: base(config.GetConnectionString("defaultConnection"), config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista las solicitudes con código de opción ACA_PROSPECTO.
		// Cómo: consulta V_ACA_FLUJO_TIPO_DOCUMENTO_PROSPECTO y ordena por correlativo.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewTipos, xWhere);
				var response = new List<ACA_FLUJO_TIPO_DOCUMENTO_PROSPECTOView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_TIPO_DOCUMENTO)
					.ToList();
				reader.Close();
				result.Data = response;
				result.Result = true;
				result.RowsAffected = response.Count;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: obtiene una solicitud ACA_PROSPECTO.
		// Cómo: consulta la vista de tipos con los filtros recibidos y toma el primero.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewTipos, xWhere);
				var response = new List<ACA_FLUJO_TIPO_DOCUMENTO_PROSPECTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				result.Data = response;
				result.Result = true;
				result.RowsAffected = response == null ? 0 : 1;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: lista los documentos ya asociados a las solicitudes.
		// Cómo: consulta la vista de la relación y ordena por tipo y orden del documento.
		public async Task<CResult> GetAsignacionesAsync(List<CParameter> xWhere)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewAsignacion, xWhere);
				var response = new List<ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_TIPO_DOCUMENTO)
					.ThenBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_DOCUMENTO_ADMISION)
					.ToList();
				reader.Close();
				result.Data = response;
				result.Result = true;
				result.RowsAffected = response.Count;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: lista el catálogo de documentos de admisión.
		// Cómo: lee ACA_DOCUMENTO_ADMISION y lo ordena por ORDEN.
		public async Task<CResult> GetDocumentosAsync()
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_TablaDocumentos, null);
				var response = new List<ACA_DOCUMENTO_ADMISIONItem>().FromDataReader(reader)
					.OrderBy(x => x.ORDEN)
					.ThenBy(x => x.CORR_DOCUMENTO_ADMISION)
					.ToList();
				reader.Close();
				result.Data = response;
				result.Result = true;
				result.RowsAffected = response.Count;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: indica si el documento ya está asociado a esa solicitud.
		// Cómo: consulta la vista de la relación por la llave compuesta.
		public async Task<bool> ExistsAsignacionAsync(int corrEmpresa, int corrTipoDocumento, int corrDocumentoAdmision)
		{
			var result = await GetAsignacionAsync(corrEmpresa, corrTipoDocumento, corrDocumentoAdmision);
			return result.Result && result.Data != null;
		}

		// Qué hace: indica si el tipo de flujo es una solicitud ACA_PROSPECTO activa.
		// Cómo: consulta la vista de tipos por empresa y correlativo.
		public async Task<bool> ExistsTipoProspectoAsync(int corrEmpresa, int corrTipoDocumento)
		{
			var result = await GetAsync(new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
				new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO", Value = corrTipoDocumento, DbType = DbType.Int32 },
			});
			return result.Result && result.Data != null;
		}

		// Qué hace: indica si el documento de admisión existe.
		// Cómo: consulta ACA_DOCUMENTO_ADMISION por su correlativo.
		public async Task<bool> ExistsDocumentoAsync(int corrDocumentoAdmision)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_TablaDocumentos, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = corrDocumentoAdmision, DbType = DbType.Int32 },
				});
				var response = new List<ACA_DOCUMENTO_ADMISIONItem>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				result.Data = response;
				result.Result = true;
			}
			catch (Exception)
			{
				result.Result = false;
				result.Data = null;
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result.Result && result.Data != null;
		}

		// Qué hace: asocia un documento a la solicitud.
		// Cómo: inserta la fila y vuelve a leerla desde la vista por la llave compuesta.
		public async Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			CResult result = new();
			try
			{
				var reader = await objData.Insert(_TableName, BuildWriteParameters(Data), string.Empty, BuildKeys(Data));
				var response = new List<ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				result.Data = response;
				result.Result = true;
				result.RowsAffected = 1;
				result.CodeHelper = Data.CORR_DOCUMENTO_ADMISION;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e, IsDuplicateKeyError(e) ? 2627 : -1,
					IsDuplicateKeyError(e) ? "Ese documento ya está asignado a la solicitud." : e.Message);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: impide cambiar la llave de la relación.
		// Cómo: devuelve error para que la pantalla elimine y vuelva a asignar.
		public Task<CResult> UpdateAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			return Task.FromResult(new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = -1,
				ErrorMessage = "La actualización de documentos por solicitud no está habilitada. Quite el documento y vuelva a marcarlo.",
				ErrorSource = "[ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository]",
				RowsAffected = 0
			});
		}

		// Qué hace: quita un documento de la solicitud.
		// Cómo: elimina la fila por empresa, tipo de flujo y documento.
		public async Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			CResult result = new();
			try
			{
				await objData.Delete(_TableName, BuildKeys(Data));
				result.Data = null;
				result.Result = true;
				result.RowsAffected = 1;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: lee una asignación por su llave.
		// Cómo: consulta la vista con las tres columnas de la primaria.
		private async Task<CResult> GetAsignacionAsync(int corrEmpresa, int corrTipoDocumento, int corrDocumentoAdmision)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewAsignacion, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO", Value = corrTipoDocumento, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = corrDocumentoAdmision, DbType = DbType.Int32 },
				});
				var response = new List<ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOView>().FromDataReader(reader).FirstOrDefault();
				reader.Close();
				result.Data = response;
				result.Result = true;
			}
			catch (Exception e)
			{
				SetError(result, e);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: arma la llave compuesta.
		// Cómo: convierte empresa, tipo y documento en parámetros de CData.
		private static List<CParameter> BuildKeys(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data) => new()
		{
			new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO", Value = Data.CORR_TIPO_DOCUMENTO, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 },
		};

		// Qué hace: arma los campos del INSERT.
		// Cómo: mapea la llave y la auditoría del modelo.
		private static List<CParameter> BuildWriteParameters(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data) => new()
		{
			new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO", Value = Data.CORR_TIPO_DOCUMENTO, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = DbType.String },
			new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = DbType.String },
			new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = DbType.DateTime },
			new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = DbType.String },
			new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = DbType.String },
			new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = DbType.DateTime },
		};

		// Qué hace: completa un resultado fallido.
		// Cómo: normaliza código, mensaje y origen para el servicio.
		private static void SetError(CResult result, Exception e, int code = -1, string message = null)
		{
			result.Data = null;
			result.Result = false;
			result.ErrorCode = code;
			result.ErrorMessage = message ?? e.Message;
			result.ErrorSource = $"[{e.Source}]";
			result.RowsAffected = 0;
		}

		// Qué hace: reconoce una llave duplicada.
		// Cómo: revisa los textos de SQL Server en la excepción.
		private static bool IsDuplicateKeyError(Exception e) =>
			e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
			e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
			e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
	}
}
