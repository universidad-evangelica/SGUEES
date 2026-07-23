using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	// Qué hace: aplica las reglas de negocio del catálogo países antes de llamar al repositorio.
	public class GEN_PAISService : IGEN_PAISService
	{
		private readonly IGEN_PAISRepository _repo;

		// Qué hace: inyecta el repositorio de países para operaciones de datos.
		public GEN_PAISService(IGEN_PAISRepository repo)
		{
			_repo = repo;
		}

		// Qué hace: lista países.
		// Cómo: llama a GetAllAsync del repositorio con BuildParameters.
		public async Task<CResult> GetAllAsync(GEN_PAISParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		// Qué hace: obtiene el país.
		// Cómo: llama a GetAsync del repositorio con las claves.
		public async Task<CResult> GetAsync(GEN_PAISParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Qué hace: crea país
		// Cómo: Validate, NormalizeData, ValidateDuplicatesAsync y CreateAsync del repositorio.
		public async Task<CResult> CreateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(Data);
			var duplicate = await ValidateDuplicatesAsync(Data, isUpdate: false);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: actualiza país
		// Cómo: Validate, NormalizeData, ValidateDuplicatesAsync y UpdateAsync del repositorio.
		public async Task<CResult> UpdateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del país.");
			}

			if (Data.CORR_PAIS <= 0)
			{
				return ValidationError("Debe indicar el país a modificar.");
			}

			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(Data);
			var duplicate = await ValidateDuplicatesAsync(Data, isUpdate: true);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: elimina el país
		// Cómo: llama a DeleteAsync del repositorio.
		public async Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: arma los parámetros de filtro para el repositorio.
		private static List<CParameter> BuildParameters(GEN_PAISParam xWhere)
		{
			return new List<CParameter>();
		}

		// Qué hace: aplica trim a los textos antes de validar y guardar.
		private static void NormalizeData(GEN_PAISTable Data)
		{
			Data.NOMBRE_PAIS = Data.NOMBRE_PAIS?.Trim();
			Data.CODIGO_PAIS = Data.CODIGO_PAIS?.Trim();
			Data.NACIONALIDAD = Data.NACIONALIDAD?.Trim();
			Data.NOMBRE_CORTO = Data.NOMBRE_CORTO?.Trim();
		}

		// Qué hace: valida campos obligatorios de el país antes de persistirla.
		private static CResult Validate(GEN_PAISTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del país.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_CORTO))
			{
				return ValidationError("Debe ingresar el nombre corto.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_PAIS))
			{
				return ValidationError("Debe ingresar el nombre del país.");
			}

			if (string.IsNullOrWhiteSpace(Data.NACIONALIDAD))
			{
				return ValidationError("Debe ingresar la nacionalidad.");
			}

			if (string.IsNullOrWhiteSpace(Data.CODIGO_PAIS))
			{
				return ValidationError("Debe ingresar el código del país.");
			}

			if (Data.NOMBRE_PAIS.Trim().Length > 100)
			{
				return ValidationError("El nombre del país no puede superar 100 caracteres.");
			}

			if (!string.IsNullOrWhiteSpace(Data.NOMBRE_CORTO) && Data.NOMBRE_CORTO.Trim().Length > 5)
			{
				return ValidationError("El nombre corto no puede superar 5 caracteres.");
			}

			return null;
		}

		// Qué hace: comprueba unicidad de el país no están registrados en el mismo ámbito.
		// Cómo: llama a ExistsByFieldAsync del repositorio.
		private async Task<CResult> ValidateDuplicatesAsync(GEN_PAISTable Data, bool isUpdate)
		{
			var excludeCorrPais = isUpdate ? Data.CORR_PAIS : 0;

			if (await _repo.ExistsByFieldAsync("NOMBRE_CORTO", NormalizeText(Data.NOMBRE_CORTO), excludeCorrPais))
			{
				return DuplicateWarning("El nombre corto ingresado ya está registrado. Escriba otro nombre corto para continuar.");
			}

			if (await _repo.ExistsByFieldAsync("NOMBRE_PAIS", NormalizeText(Data.NOMBRE_PAIS), excludeCorrPais))
			{
				return DuplicateWarning("El nombre de país ingresado ya está registrado. Escriba otro nombre para continuar.");
			}

			if (await _repo.ExistsByFieldAsync("NACIONALIDAD", NormalizeText(Data.NACIONALIDAD), excludeCorrPais))
			{
				return DuplicateWarning("La nacionalidad ingresada ya está registrada. Escriba otra nacionalidad para continuar.");
			}

			if (await _repo.ExistsByFieldAsync("CODIGO_PAIS", NormalizeText(Data.CODIGO_PAIS), excludeCorrPais))
			{
				return DuplicateWarning("El código de país ingresado ya está registrado. Escriba otro código para continuar.");
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
				ErrorSource = "[GEN_PAISService]",
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
				ErrorSource = "[GEN_PAISService]",
				RowsAffected = 0
			};
		}
	}
}
