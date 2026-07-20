using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	// Qué hace: aplica las reglas de negocio del catálogo departamentos antes de llamar al repositorio.
	public class GEN_DEPTOService : IGEN_DEPTOService
	{
		private readonly IGEN_DEPTORepository _repo;

		// Qué hace: inyecta el repositorio de departamentos para operaciones de datos.
		public GEN_DEPTOService(IGEN_DEPTORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista departamentos.
		// Cómo: llama a GetAllAsync del repositorio con BuildParameters.
		public async Task<CResult> GetAllAsync(GEN_DEPTOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: obtiene el departamento.
		// Cómo: llama a GetAsync del repositorio con las claves.
		public async Task<CResult> GetAsync(GEN_DEPTOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = xWhere.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Qué hace: crea departamento
		// Cómo: Validate, NormalizeData, ValidateDuplicatesAsync y CreateAsync del repositorio.
		public async Task<CResult> CreateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidateDepto(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeDepto(data);
			var duplicate = await ValidateDeptoDuplicatesAsync(data, isUpdate: false);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateAsync(data, vLoginSistema, vEstacion);
		}

		// Qué hace: actualiza departamento
		// Cómo: Validate, NormalizeData, ValidateDuplicatesAsync y UpdateAsync del repositorio.
		public async Task<CResult> UpdateAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidateDepto(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeDepto(data);
			var duplicate = await ValidateDeptoDuplicatesAsync(data, isUpdate: true);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateAsync(data, vLoginSistema, vEstacion);
		}

		// Qué hace: elimina el departamento
		// Cómo: llama a DeleteAsync del repositorio.
		public async Task<CResult> DeleteAsync(GEN_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeleteAsync(data, vLoginSistema, vEstacion);
		}

		// Qué hace: arma los parámetros de filtro para el repositorio.
		private static List<CParameter> BuildParameters(GEN_DEPTOParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere.CORR_PAIS > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 });
			}

			return p;
		}

		// Qué hace: aplica trim a los textos del departamento antes de guardar.
		private static void NormalizeDepto(GEN_DEPTOTable data)
		{
			data.NOMBRE_DEPTO = data.NOMBRE_DEPTO?.Trim();
			data.CODIGO_DEPTO = data.CODIGO_DEPTO?.Trim();
		}

		// Qué hace: valida campos obligatorios del departamento antes de guardar.
		private static CResult ValidateDepto(GEN_DEPTOTable data)
		{
			if (data == null)
			{
				return ValidationError("No se recibieron datos del departamento.");
			}

			if (data.CORR_PAIS <= 0)
			{
				return ValidationError("Debe seleccionar un país.");
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE_DEPTO))
			{
				return ValidationError("Debe ingresar el nombre del departamento.");
			}

			if (string.IsNullOrWhiteSpace(data.CODIGO_DEPTO))
			{
				return ValidationError("Debe ingresar el código del departamento.");
			}

			return null;
		}

		// Qué hace: verifica que la sesión tenga una empresa válida.
		private static CResult ValidateCorrEmpresa(int corrEmpresa, string etiquetaRegistro)
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
				ErrorMessage =
					$"No se pudo guardar {etiquetaRegistro} porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_DEPTOService]",
				RowsAffected = 0
			};
		}

		// Qué hace: comprueba unicidad de nombre y código del departamento en el país.
		// Cómo: llama a ExistsByFieldAsync del repositorio.
		private async Task<CResult> ValidateDeptoDuplicatesAsync(GEN_DEPTOTable data, bool isUpdate)
		{
			var excludeCorrPais = isUpdate ? data.CORR_PAIS : 0;
			var excludeCorrDepto = isUpdate ? data.CORR_DEPTO : 0;

			if (await _repo.ExistsDeptoByFieldAsync(data.CORR_PAIS, "NOMBRE_DEPTO", NormalizeText(data.NOMBRE_DEPTO), excludeCorrPais, excludeCorrDepto))
			{
				return DuplicateWarning("El nombre de departamento ingresado ya está registrado. Escriba otro nombre para continuar.");
			}

			if (await _repo.ExistsDeptoByFieldAsync(data.CORR_PAIS, "CODIGO_DEPTO", NormalizeText(data.CODIGO_DEPTO), excludeCorrPais, excludeCorrDepto))
			{
				return DuplicateWarning("El código de departamento ingresado ya está registrado. Escriba otro código para continuar.");
			}

			return null;
		}

		// Qué hace: normaliza texto para comparar duplicados.
		private static string NormalizeText(string value)
		{
			return (value ?? string.Empty).Trim().ToUpperInvariant();
		}

		// Qué hace: arma respuesta controlada de duplicado (ErrorCode 2627).
		private static CResult DuplicateWarning(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = 2627,
				ErrorMessage = message,
				ErrorSource = "[GEN_DEPTOService]",
				RowsAffected = 0
			};
		}

		// Qué hace: arma respuesta uniforme de error de validación.
		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Data = null,
				Result = false,
				CodeHelper = 0,
				ErrorCode = -1,
				ErrorMessage = message,
				ErrorSource = "[GEN_DEPTOService]",
				RowsAffected = 0
			};
		}
	}
}
