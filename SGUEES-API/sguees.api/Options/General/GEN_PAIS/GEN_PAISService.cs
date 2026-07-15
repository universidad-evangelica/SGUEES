using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class GEN_PAISService : IGEN_PAISService
	{
		private readonly IGEN_PAISRepository _repo;

		public GEN_PAISService(IGEN_PAISRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PAISParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetAsync(GEN_PAISParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

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

		public async Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(GEN_PAISParam xWhere)
		{
			return new List<CParameter>();
		}

		private static void NormalizeData(GEN_PAISTable Data)
		{
			Data.NOMBRE_PAIS = Data.NOMBRE_PAIS?.Trim();
			Data.CODIGO_PAIS = Data.CODIGO_PAIS?.Trim();
			Data.NACIONALIDAD = Data.NACIONALIDAD?.Trim();
			Data.NOMBRE_CORTO = Data.NOMBRE_CORTO?.Trim();
		}

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

		private static string NormalizeText(string value)
		{
			return (value ?? string.Empty).Trim().ToUpperInvariant();
		}

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
