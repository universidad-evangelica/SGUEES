using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	// Qué hace: aplica las reglas de negocio del catálogo distritos antes de llamar al repositorio.
	public class GEN_DISTRITOService : IGEN_DISTRITOService
	{
		private readonly IGEN_DISTRITORepository _repo;

		// Qué hace: inyecta el repositorio de distritos para operaciones de datos.
		public GEN_DISTRITOService(IGEN_DISTRITORepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista distritos.
		// Cómo: llama a GetAllAsync del repositorio con BuildParameters.
		public async Task<CResult> GetAllAsync(GEN_DISTRITOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: obtiene el distrito.
		// Cómo: llama a GetAsync del repositorio con las claves.
		public async Task<CResult> GetAsync(GEN_DISTRITOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA);
			if (validation != null)
			{
				return validation;
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = xWhere.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = xWhere.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DISTRITO", Value = xWhere.CORR_DISTRITO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Qué hace: crea distrito
		// Cómo: Validate, NormalizeData, ValidateDuplicatesAsync y CreateAsync del repositorio.
		public async Task<CResult> CreateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = Validate(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(data);
			var duplicate = await ValidateDuplicatesAsync(data, isUpdate: false);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateAsync(data, vLoginSistema, vEstacion);
		}

		// Qué hace: actualiza distrito
		// Cómo: Validate, NormalizeData, ValidateDuplicatesAsync y UpdateAsync del repositorio.
		public async Task<CResult> UpdateAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = Validate(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(data);
			var duplicate = await ValidateDuplicatesAsync(data, isUpdate: true);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateAsync(data, vLoginSistema, vEstacion);
		}

		// Qué hace: elimina el distrito
		// Cómo: llama a DeleteAsync del repositorio.
		public async Task<CResult> DeleteAsync(GEN_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeleteAsync(data, vLoginSistema, vEstacion);
		}

		// Qué hace: arma los parámetros de filtro para el repositorio.
		private static List<CParameter> BuildParameters(GEN_DISTRITOParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere.CORR_PAIS > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 });
			}

			if (xWhere.CORR_DEPTO > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_DEPTO", Value = xWhere.CORR_DEPTO, DbType = System.Data.DbType.Int32 });
			}

			if (xWhere.CORR_MUNICIPIO > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = xWhere.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 });
			}

			return p;
		}

		// Qué hace: aplica trim a los textos antes de validar y guardar.
		private static void NormalizeData(GEN_DISTRITOTable data)
		{
			data.NOMBRE_DISTRITO = data.NOMBRE_DISTRITO?.Trim();
		}

		// Qué hace: valida campos obligatorios de el distrito antes de persistirla.
		private static CResult Validate(GEN_DISTRITOTable data)
		{
			if (data == null)
			{
				return ValidationError("No se recibieron datos del distrito.");
			}

			if (data.CORR_PAIS <= 0 || data.CORR_DEPTO <= 0 || data.CORR_MUNICIPIO <= 0)
			{
				return ValidationError("Debe seleccionar un municipio.");
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE_DISTRITO))
			{
				return ValidationError("Debe ingresar el nombre del distrito.");
			}

			return null;
		}

		// Qué hace: comprueba unicidad de el distrito no están registrados en el mismo ámbito.
		// Cómo: llama a ExistsByFieldAsync del repositorio.
		private async Task<CResult> ValidateDuplicatesAsync(GEN_DISTRITOTable data, bool isUpdate)
		{
			var excludeCorrPais = isUpdate ? data.CORR_PAIS : 0;
			var excludeCorrDepto = isUpdate ? data.CORR_DEPTO : 0;
			var excludeCorrMunicipio = isUpdate ? data.CORR_MUNICIPIO : 0;
			var excludeCorrDistrito = isUpdate ? data.CORR_DISTRITO : 0;

			if (await _repo.ExistsDistritoByFieldAsync(
				data.CORR_PAIS,
				data.CORR_DEPTO,
				data.CORR_MUNICIPIO,
				"NOMBRE_DISTRITO",
				NormalizeText(data.NOMBRE_DISTRITO),
				excludeCorrPais,
				excludeCorrDepto,
				excludeCorrMunicipio,
				excludeCorrDistrito))
			{
				return DuplicateWarning("El nombre de distrito ingresado ya está registrado. Escriba otro nombre para continuar.");
			}

			return null;
		}

		// Qué hace: normaliza texto para comparar duplicados.
		private static string NormalizeText(string value)
		{
			return (value ?? string.Empty).Trim().ToUpperInvariant();
		}

		// Qué hace: verifica que la sesión tenga una empresa válida.
		private static CResult ValidateCorrEmpresa(int corrEmpresa)
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
					"No se pudo guardar el distrito porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_DISTRITOService]",
				RowsAffected = 0
			};
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
				ErrorSource = "[GEN_DISTRITOService]",
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
				ErrorSource = "[GEN_DISTRITOService]",
				RowsAffected = 0
			};
		}
	}
}
