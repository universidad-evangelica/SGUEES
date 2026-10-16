// Qué hace: valida y coordina qué documentos de admisión se muestran en cada solicitud.
// Cómo: exige empresa, un tipo ACA_PROSPECTO y un documento existente antes de insertar o eliminar.
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService : IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService
	{
		private readonly IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository _repo;

		public ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService(IACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista las solicitudes ACA_PROSPECTO de la empresa.
		// Cómo: filtra la vista de tipos por CORR_EMPRESA.
		public async Task<CResult> GetAllAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere) =>
			await _repo.GetAllAsync(BuildEmpresa(xWhere));

		// Qué hace: obtiene una solicitud ACA_PROSPECTO.
		// Cómo: filtra por empresa y correlativo del tipo.
		public async Task<CResult> GetAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere) =>
			await _repo.GetAsync(BuildTipo(xWhere));

		// Qué hace: lista los documentos ya marcados.
		// Cómo: filtra la vista de la relación por empresa y, si viene, por tipo.
		public async Task<CResult> GetAsignacionesAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere) =>
			await _repo.GetAsignacionesAsync(BuildAsignacion(xWhere));

		// Qué hace: entrega el catálogo de documentos de admisión.
		// Cómo: delega la lectura de ACA_DOCUMENTO_ADMISION.
		public async Task<CResult> GetDocumentosAsync() =>
			await _repo.GetDocumentosAsync();

		// Qué hace: asocia un documento a la solicitud.
		// Cómo: valida empresa, tipo ACA_PROSPECTO, documento y que no esté repetido.
		public async Task<CResult> CreateAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION)
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
			if (!await _repo.ExistsTipoProspectoAsync(Data.CORR_EMPRESA, Data.CORR_TIPO_DOCUMENTO))
			{
				return ValidationError("La solicitud no corresponde a un tipo de documento ACA_PROSPECTO.");
			}
			if (!await _repo.ExistsDocumentoAsync(Data.CORR_DOCUMENTO_ADMISION))
			{
				return ValidationError("El documento de admisión no existe.");
			}
			if (await _repo.ExistsAsignacionAsync(Data.CORR_EMPRESA, Data.CORR_TIPO_DOCUMENTO, Data.CORR_DOCUMENTO_ADMISION))
			{
				return DuplicateWarning("Ese documento ya está asignado a la solicitud.");
			}
			return await _repo.CreateAsync(Data, vUSER_SISTEMA, vESTACION);
		}

		// Qué hace: quita un documento de la solicitud.
		// Cómo: valida la llave y elimina la fila.
		public async Task<CResult> DeleteAsync(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data, string vUSER_SISTEMA, string vESTACION)
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

		// Qué hace: arma el filtro de empresa.
		// Cómo: envía solo CORR_EMPRESA a la vista de tipos.
		private static List<CParameter> BuildEmpresa(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere) => new()
		{
			new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = DbType.Int32 },
		};

		// Qué hace: arma el filtro de una solicitud.
		// Cómo: envía empresa y tipo de documento.
		private static List<CParameter> BuildTipo(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere)
		{
			var parameters = BuildEmpresa(xWhere);
			if (xWhere.CORR_TIPO_DOCUMENTO > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO", Value = xWhere.CORR_TIPO_DOCUMENTO, DbType = DbType.Int32 });
			}
			return parameters;
		}

		// Qué hace: arma el filtro de asignaciones.
		// Cómo: siempre incluye empresa y agrega tipo o documento cuando vienen.
		private static List<CParameter> BuildAsignacion(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam xWhere)
		{
			var parameters = BuildTipo(xWhere);
			if (xWhere.CORR_DOCUMENTO_ADMISION > 0)
			{
				parameters.Add(new CParameter() { ParameterName = "CORR_DOCUMENTO_ADMISION", Value = xWhere.CORR_DOCUMENTO_ADMISION, DbType = DbType.Int32 });
			}
			return parameters;
		}

		// Qué hace: valida la llave de la asignación.
		// Cómo: exige tipo de flujo y documento mayores a cero.
		private static CResult Validate(ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de la asignación.");
			}
			if (Data.CORR_TIPO_DOCUMENTO <= 0)
			{
				return ValidationError("Debe seleccionar la solicitud.");
			}
			if (Data.CORR_DOCUMENTO_ADMISION <= 0)
			{
				return ValidationError("Debe seleccionar un documento.");
			}
			return null;
		}

		// Qué hace: valida la empresa de la sesión.
		// Cómo: devuelve 4100 cuando CORR_EMPRESA no es válido.
		private static CResult ValidateEmpresaSesion(int corrEmpresa) =>
			corrEmpresa > 0 ? null : Error(4100,
				"No se pudo guardar porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.");

		// Qué hace: advierte una asignación duplicada.
		// Cómo: usa el código 2627.
		private static CResult DuplicateWarning(string message) => Error(2627, message);

		// Qué hace: devuelve un error de validación.
		// Cómo: usa código -1.
		private static CResult ValidationError(string message) => Error(-1, message);

		// Qué hace: construye un resultado fallido.
		// Cómo: asigna código, mensaje y cero filas afectadas.
		private static CResult Error(int code, string message) => new()
		{
			Data = null,
			Result = false,
			CodeHelper = 0,
			ErrorCode = code,
			ErrorMessage = message,
			ErrorSource = "[ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOService]",
			RowsAffected = 0
		};
	}
}
