// Qué hace: aplica las reglas de negocio del catálogo gerencias antes de llamar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: valida los datos de gerencia y coordina su persistencia con el repositorio.
	public class GEN_GERENCIAService : IGEN_GERENCIAService
	{
		private readonly IGEN_GERENCIARepository _repo;

		public GEN_GERENCIAService(IGEN_GERENCIARepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista las gerencias según los filtros recibidos.
		// Cómo: llama a GetAllAsync del repositorio con los parámetros armados en BuildParameters.
		public async Task<CResult> GetAllAsync(GEN_GERENCIAParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: obtiene una gerencia por su correlativo.
		// Cómo: llama a GetAsync del repositorio con CORR_EMPRESA y CORR_GERENCIA.
		public async Task<CResult> GetAsync(GEN_GERENCIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_GERENCIA", Value = xWhere.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Qué hace: crea una gerencia nueva.
		// Cómo: valida empresa y datos, normaliza campos, comprueba código único y llama a CreateAsync del repositorio.
		public async Task<CResult> CreateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			Data.NOMBRE_GERENCIA = Data.NOMBRE_GERENCIA.Trim();
			Data.CODIGO_GERENCIA = Data.CODIGO_GERENCIA.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, null);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: actualiza una gerencia existente.
		// Cómo: valida empresa, datos y código único; normaliza campos y llama a UpdateAsync del repositorio.
		public async Task<CResult> UpdateAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			Data.NOMBRE_GERENCIA = Data.NOMBRE_GERENCIA.Trim();
			Data.CODIGO_GERENCIA = Data.CODIGO_GERENCIA.Trim();

			var duplicate = await ValidateUniqueCodigoAsync(Data, Data.CORR_GERENCIA);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: elimina una gerencia.
		// Cómo: valida empresa de sesión y llama a DeleteAsync del repositorio.
		public async Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: arma el parámetro CORR_EMPRESA para filtrar en el repositorio.
		private static List<CParameter> BuildParameters(GEN_GERENCIAParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		// Qué hace: valida campos obligatorios de la gerencia antes de persistirla.
		private static CResult Validate(GEN_GERENCIATable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos de gerencia.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_GERENCIA))
			{
				return ValidationError("Debe ingresar el nombre de gerencia.");
			}

			if (Data.NOMBRE_GERENCIA.Trim().Length > 100)
			{
				return ValidationError("El nombre de gerencia no puede superar 100 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.CODIGO_GERENCIA))
			{
				return ValidationError("Debe ingresar el codigo de gerencia.");
			}

			if (Data.CODIGO_GERENCIA.Trim().Length > 10)
			{
				return ValidationError("El codigo de gerencia no puede superar 10 caracteres.");
			}

			if (!Data.CORR_DIVISION.HasValue || Data.CORR_DIVISION <= 0)
			{
				return ValidationError("Debe seleccionar la division.");
			}

			return null;
		}

		// Qué hace: comprueba que el código de gerencia sea único en la empresa.
		// Cómo: llama a ExistsCodigoAsync del repositorio.
		private async Task<CResult> ValidateUniqueCodigoAsync(GEN_GERENCIATable Data, int? excludeCorr)
		{
			var exists = await _repo.ExistsCodigoAsync(
				Data.CORR_EMPRESA,
				Data.CODIGO_GERENCIA,
				excludeCorr ?? 0);

			if (!exists)
			{
				return null;
			}

			var codigo = (Data.CODIGO_GERENCIA ?? string.Empty).Trim();
			return DuplicateWarning(
				$"Ya existe una gerencia con el codigo {codigo}. Escriba otro codigo para continuar.");
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
				ErrorMessage = "No se pudo guardar la gerencia porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_GERENCIAService]",
				RowsAffected = 0
			};
		}

		// Qué hace: arma respuesta controlada de duplicado (ErrorCode 2627 → Warning en el front).
		private static CResult DuplicateWarning(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 2627,
				ErrorMessage = message,
				ErrorSource = "[GEN_GERENCIAService]",
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
				ErrorSource = "[GEN_GERENCIAService]",
				RowsAffected = 0
			};
		}
	}
}
