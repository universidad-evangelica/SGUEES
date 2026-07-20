// Qué hace: aplica las reglas de negocio del catálogo divisiones antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: valida los datos de división y coordina su persistencia con el repositorio.
	public class GEN_DIVISIONService : IGEN_DIVISIONService
	{
		private readonly IGEN_DIVISIONRepository _repo;

		public GEN_DIVISIONService(IGEN_DIVISIONRepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista las divisiones según los filtros recibidos.
		// Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
		public async Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: entrega divisiones para lookups de otras vistas.
		// Cómo: llama a GetDivisionesAsync del repositorio con CORR_EMPRESA.
		public async Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetDivisionesAsync(p);
		}

		// Qué hace: obtiene una división por su correlativo.
		// Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_DIVISION.
		public async Task<CResult> GetAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DIVISION", Value = xWhere.CORR_DIVISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Qué hace: crea una división nueva.
		// Cómo: valida empresa y datos, normaliza campos, comprueba código único y llama a CreateAsync del repositorio.
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

		// Qué hace: actualiza una división existente.
		// Cómo: valida empresa, datos y código único; normaliza campos y llama a UpdateAsync del repositorio.
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

		// Qué hace: elimina una división.
		// Cómo: valida empresa de sesión y llama a DeleteAsync del repositorio.
		public async Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
		private static List<CParameter> BuildParameters(GEN_DIVISIONParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		// Qué hace: valida campos obligatorios de la división antes de persistirla.
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

		// Qué hace: comprueba que el código de división sea único en la empresa.
		// Cómo: llama a ExistsCodigoAsync del repositorio.
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

		// Qué hace: verifica que la sesión tenga empresa válida.
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

		// Qué hace: construye una respuesta uniforme para errores de validación.
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
