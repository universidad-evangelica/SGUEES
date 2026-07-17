using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_DIVISIONService : IGEN_DIVISIONService
	{
		private readonly IGEN_DIVISIONRepository _repo;

		public GEN_DIVISIONService(IGEN_DIVISIONRepository repo)
		{
			_repo = repo;
		}

		// Construye los filtros y solicita al repositorio el listado de divisiones.
		public async Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Prepara los filtros del catálogo y solicita al repositorio las divisiones disponibles.
		public async Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetDivisionesAsync(p);
		}

		// Valida las claves de consulta y solicita al repositorio el detalle de la división.
		public async Task<CResult> GetAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DIVISION", Value = xWhere.CORR_DIVISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Normaliza y valida la división, comprueba duplicados y solicita su creación.
		public async Task<CResult> CreateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			Data.NOMBRE_DIVISION = Data.NOMBRE_DIVISION.Trim();
			Data.CODIGO_DIVISION = Data.CODIGO_DIVISION.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, null);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Normaliza y valida la división, comprueba duplicados y solicita su actualización.
		public async Task<CResult> UpdateAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			Data.NOMBRE_DIVISION = Data.NOMBRE_DIVISION.Trim();
			Data.CODIGO_DIVISION = Data.CODIGO_DIVISION.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, Data.CORR_DIVISION);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Valida la identidad de la división y solicita su eliminación al repositorio.
		public async Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Convierte los filtros recibidos en parámetros seguros para el repositorio.
		private static List<CParameter> BuildParameters(GEN_DIVISIONParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		// Valida las claves y campos obligatorios de la división antes de persistirla.
		private static CResult Validate(GEN_DIVISIONTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de division.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_DIVISION))
			{
				return ValidationError("Debe ingresar el nombre de division.");
			}

			if (Data.NOMBRE_DIVISION.Trim().Length > 100)
			{
				return ValidationError("El nombre de division no puede superar 100 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.CODIGO_DIVISION))
			{
				return ValidationError("Debe ingresar el codigo de division.");
			}

			if (Data.CODIGO_DIVISION.Trim().Length > 10)
			{
				return ValidationError("El codigo de division no puede superar 10 caracteres.");
			}

			return null;
		}

		// Comprueba que el código de la división sea único dentro de la empresa.
		private async Task<CResult> ValidateUniqueCodigoAsync(GEN_DIVISIONTable Data, int? excludeCorr)
		{
			var exists = await _repo.ExistsCodigoAsync(
				Data.CORR_EMPRESA,
				Data.CODIGO_DIVISION,
				excludeCorr ?? 0);

			return exists
				? ValidationError($"Ya existe una division con el codigo {Data.CODIGO_DIVISION}.")
				: null;
		}

		// Verifica que la sesión tenga una empresa válida y prepara una respuesta controlada si falta.
		private static CResult ValidateEmpresaSesion(int corrEmpresa)
		{
			if (corrEmpresa > 0)
			{
				return null;
			}

			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 4100,
				ErrorMessage = "No se pudo guardar la division porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_DIVISIONService]",
				RowsAffected = 0
			};
		}

		// Construye una respuesta uniforme para devolver errores de validación al cliente.
		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[GEN_DIVISIONService]",
				RowsAffected = 0
			};
		}
	}
}
