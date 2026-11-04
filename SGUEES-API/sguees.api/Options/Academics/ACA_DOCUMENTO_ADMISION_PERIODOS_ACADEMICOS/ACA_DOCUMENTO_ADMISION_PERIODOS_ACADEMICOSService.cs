// Qué hace: valida y coordina qué documentos se muestran en cada período.
// Cómo: exige empresa, un documento existente y un período de esa empresa antes de insertar o eliminar.
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService : IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService
	{
		private readonly IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository _repo;

		public ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService(IACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSRepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista los documentos de admisión.
		// Cómo: el catálogo no lleva empresa; el contador de períodos se arma en la pantalla.
		public async Task<CResult> GetAllAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere) =>
			await _repo.GetAllAsync(null);

		// Qué hace: obtiene un documento.
		// Cómo: consulta el catálogo por correlativo.
		public async Task<CResult> GetAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere) =>
			await _repo.GetAsync(new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = xWhere.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 },
			});

		// Qué hace: lista las marcas de la empresa.
		// Cómo: filtra la vista por empresa y, si viene, por documento o período.
		public async Task<CResult> GetAsignacionesAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere) =>
			await _repo.GetAsignacionesAsync(BuildAsignacion(xWhere));

		// Qué hace: marca el documento en el período.
		// Cómo: valida empresa, documento, período y que la marca no exista.
		public async Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}
			if (!await _repo.ExistsDocumentoAsync(Data.CORR_DOCUMENTO_ADMISION))
			{
				return ValidationError("El documento de admisión no existe.");
			}
			if (!await _repo.ExistsPeriodoAsync(Data.CORR_EMPRESA, Data.CORR_PERIODO_ACADEMICO))
			{
				return ValidationError("El período no pertenece a la empresa de la sesión.");
			}
			if (await _repo.ExistsAsignacionAsync(Data.CORR_EMPRESA, Data.CORR_PERIODO_ACADEMICO, Data.CORR_DOCUMENTO_ADMISION))
			{
				return DuplicateWarning("Ese período ya está marcado para el documento.");
			}
			return await _repo.CreateAsync(Data, vUSER_SISTEMA, vESTACION);
		}

		// Qué hace: quita el período del documento.
		// Cómo: valida la llave y elimina la fila.
		public async Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data, string vUSER_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}
			return await _repo.DeleteAsync(Data, vUSER_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildAsignacion(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam xWhere)
		{
			var parameters = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = DbType.Int32 },
			};
			if (xWhere.CORR_DOCUMENTO_ADMISION > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = xWhere.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 });
			}
			if (xWhere.CORR_PERIODO_ACADEMICO > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "CORR_PERIODO_ACADEMICO", Value = xWhere.CORR_PERIODO_ACADEMICO, DbType = DbType.Int32 });
			}
			return parameters;
		}

		private static CResult Validate(ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de la asignación.");
			}
			if (Data.CORR_DOCUMENTO_ADMISION <= 0)
			{
				return ValidationError("Debe seleccionar un documento.");
			}
			if (Data.CORR_PERIODO_ACADEMICO <= 0)
			{
				return ValidationError("Debe seleccionar un período.");
			}
			return null;
		}

		private static CResult ValidateEmpresaSesion(int corrEmpresa) =>
			corrEmpresa > 0 ? null : Error(4100,
				"No se pudo guardar porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.");

		private static CResult DuplicateWarning(string message) => Error(2627, message);

		private static CResult ValidationError(string message) => Error(-1, message);

		private static CResult Error(int code, string message) => new()
		{
			Data = null,
			Result = false,
			CodeHelper = 0,
			ErrorCode = code,
			ErrorMessage = message,
			ErrorSource = "[ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSService]",
			RowsAffected = 0
		};
	}
}
