// Qué hace: acceso a datos de los documentos que se muestran en cada período.
// Cómo: lee el catálogo ACA_DOCUMENTO_ADMISION y la vista de la relación.
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
	public class ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository
		: BaseRepository<ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable>, IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository
	{
		private const string _TableName = "ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS";
		private const string _ViewAsignacion = "V_ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOS";
		private const string _ViewPeriodos = "V_ACA_PERIODOS_MTTO";
		private const string _TablaDocumentos = "ACA_DOCUMENTO_ADMISION";

		public ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository(IConfiguration config)
			: base(config.GetConnectionString("defaultConnection"), config.GetSection("DbProvider:defaultProvider").Value)
		{
		}

		// Qué hace: lista el catálogo de documentos de admisión.
		// Cómo: lee ACA_DOCUMENTO_ADMISION y lo ordena por ORDEN.
		public async Task<CResult> GetAllAsync(List<CParameter> xWhere)
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

		// Qué hace: obtiene un documento del catálogo.
		// Cómo: consulta ACA_DOCUMENTO_ADMISION por su correlativo.
		public async Task<CResult> GetAsync(List<CParameter> xWhere)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_TablaDocumentos, xWhere);
				var response = new List<ACA_DOCUMENTO_ADMISIONItem>().FromDataReader(reader).FirstOrDefault();
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

		// Qué hace: lista los períodos ya marcados para cada documento.
		// Cómo: consulta la vista de la relación y ordena por documento y año.
		public async Task<CResult> GetAsignacionesAsync(List<CParameter> xWhere)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewAsignacion, xWhere);
				var response = new List<ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSView>().FromDataReader(reader)
					.OrderBy(x => x.CORR_DOCUMENTO_ADMISION)
					.ThenByDescending(x => x.ANIO)
					.ThenBy(x => x.NUMERO_PERIODO)
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

		// Qué hace: indica si el documento ya está marcado en ese período.
		// Cómo: consulta la vista de la relación por la llave compuesta.
		public async Task<bool> ExistsAsignacionAsync(int corrEmpresa, int corrPeriodo, int corrDocumento)
		{
			var result = await GetAsignacionAsync(corrEmpresa, corrPeriodo, corrDocumento);
			return result.Result && result.Data != null;
		}

		// Qué hace: indica si el período pertenece a la empresa de la sesión.
		// Cómo: consulta V_ACA_PERIODOS_MTTO por empresa y correlativo.
		public async Task<bool> ExistsPeriodoAsync(int corrEmpresa, int corrPeriodo)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewPeriodos, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERIODO_ACADEMICO", Value = corrPeriodo, DbType = DbType.Int32 },
				});
				var response = new List<ACA_PERIODO_ACADEMICO_DOCUMENTOItem>().FromDataReader(reader).FirstOrDefault();
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

		// Qué hace: indica si el documento de admisión existe.
		// Cómo: consulta ACA_DOCUMENTO_ADMISION por su correlativo.
		public async Task<bool> ExistsDocumentoAsync(int corrDocumentoAdmision)
		{
			var result = await GetAsync(new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = corrDocumentoAdmision, DbType = DbType.Int32 },
			});
			return result.Result && result.Data != null;
		}

		// Qué hace: marca un documento en el período.
		// Cómo: inserta la fila y vuelve a leerla desde la vista por la llave compuesta.
		public async Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			CResult result = new();
			try
			{
				var reader = await objData.Insert(_TableName, BuildWriteParameters(Data), string.Empty, BuildKeys(Data));
				reader.Close();
				var leida = await GetAsignacionAsync(Data.CORR_EMPRESA, Data.CORR_PERIODO_ACADEMICO, Data.CORR_DOCUMENTO_ADMISION);
				result.Data = leida.Data;
				result.Result = true;
				result.RowsAffected = 1;
				result.CodeHelper = Data.CORR_PERIODO_ACADEMICO;
				result.ErrorCode = 0;
				result.ErrorMessage = string.Empty;
				result.ErrorSource = string.Empty;
			}
			catch (Exception e)
			{
				SetError(result, e, IsDuplicateKeyError(e) ? 2627 : -1,
					IsDuplicateKeyError(e) ? "Ese período ya está marcado para el documento." : e.Message);
			}
			finally
			{
				objData.objConnection.Close();
			}
			return result;
		}

		// Qué hace: impide cambiar la llave de la relación.
		// Cómo: la pantalla quita el período y lo vuelve a marcar.
		public Task<CResult> UpdateAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			return Task.FromResult(new CResult
			{
				Data = null,
				Result = false,
				ErrorCode = -1,
				ErrorMessage = "La actualización de documentos por período no está habilitada. Quite el período y vuelva a marcarlo.",
				ErrorSource = "[ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository]",
				RowsAffected = 0
			});
		}

		// Qué hace: quita un período del documento.
		// Cómo: elimina la fila por empresa, período y documento.
		public async Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION)
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

		// Qué hace: lee una marca por su llave.
		// Cómo: consulta la vista con las tres columnas de la primaria.
		private async Task<CResult> GetAsignacionAsync(int corrEmpresa, int corrPeriodo, int corrDocumento)
		{
			CResult result = new();
			try
			{
				var reader = await objData.GetDataReader(_ViewAsignacion, new List<CParameter>
				{
					new CParameter() { ParameterName = "CORR_EMPRESA", Value = corrEmpresa, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_PERIODO_ACADEMICO", Value = corrPeriodo, DbType = DbType.Int32 },
					new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = corrDocumento, DbType = DbType.Int32 },
				});
				var response = new List<ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSView>().FromDataReader(reader).FirstOrDefault();
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

		private static List<CParameter> BuildKeys(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data) => new()
		{
			new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_PERIODO_ACADEMICO", Value = Data.CORR_PERIODO_ACADEMICO, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 },
		};

		private static List<CParameter> BuildWriteParameters(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data) => new()
		{
			new CParameter() { ParameterName = "CORR_EMPRESA", Value = Data.CORR_EMPRESA, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_PERIODO_ACADEMICO", Value = Data.CORR_PERIODO_ACADEMICO, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = Data.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 },
			new CParameter() { ParameterName = "USUARIO_CREA", Value = Data.USUARIO_CREA, DbType = DbType.String },
			new CParameter() { ParameterName = "ESTACION_CREA", Value = Data.ESTACION_CREA, DbType = DbType.String },
			new CParameter() { ParameterName = "FECHA_CREA", Value = Data.FECHA_CREA, DbType = DbType.DateTime },
			new CParameter() { ParameterName = "USUARIO_ACTU", Value = Data.USUARIO_ACTU, DbType = DbType.String },
			new CParameter() { ParameterName = "ESTACION_ACTU", Value = Data.ESTACION_ACTU, DbType = DbType.String },
			new CParameter() { ParameterName = "FECHA_ACTU", Value = Data.FECHA_ACTU, DbType = DbType.DateTime },
		};

		private static void SetError(CResult result, Exception e, int code = -1, string message = null)
		{
			result.Data = null;
			result.Result = false;
			result.ErrorCode = code;
			result.ErrorMessage = message ?? e.Message;
			result.ErrorSource = $"[{e.Source}]";
			result.RowsAffected = 0;
		}

		private static bool IsDuplicateKeyError(Exception e) =>
			e.Message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
			e.Message.Contains("PRIMARY KEY", StringComparison.OrdinalIgnoreCase) ||
			e.Message.Contains("UNIQUE KEY", StringComparison.OrdinalIgnoreCase);
	}
}
