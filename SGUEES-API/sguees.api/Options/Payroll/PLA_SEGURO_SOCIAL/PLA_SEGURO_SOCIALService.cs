// Qué hace: capa de servicio del catálogo Seguro Social.
// Cómo lo hace: valida datos y delega CRUD/ActivarInactivar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class PLA_SEGURO_SOCIALService : IPLA_SEGURO_SOCIALService
	{
		private readonly IPLA_SEGURO_SOCIALRepository _repo;

		public PLA_SEGURO_SOCIALService(IPLA_SEGURO_SOCIALRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(PLA_SEGURO_SOCIALParam xWhere)
		{
			return await _repo.GetAllAsync(new List<CParameter>());
		}

		public async Task<CResult> GetAsync(PLA_SEGURO_SOCIALParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_SEGURO_SOCIAL", Value = xWhere.CORR_SEGURO_SOCIAL, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(Data);
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			if (Data.CORR_SEGURO_SOCIAL <= 0)
			{
				return ValidationError("No se pudo identificar el seguro social a actualizar.");
			}

			NormalizeData(Data);
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(PLA_SEGURO_SOCIALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_SEGURO_SOCIAL <= 0)
			{
				return ValidationError("No se pudo identificar el seguro social a actualizar.");
			}

			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static void NormalizeData(PLA_SEGURO_SOCIALTable Data)
		{
			Data.NOMBRE_SEGURO_SOCIAL = (Data.NOMBRE_SEGURO_SOCIAL ?? string.Empty).Trim();
			Data.NOMBRE_CORTO_SEGURO = (Data.NOMBRE_CORTO_SEGURO ?? string.Empty).Trim();
			Data.ACTIVO_SEGURO_SOCIAL ??= true;
		}

		private static CResult Validate(PLA_SEGURO_SOCIALTable Data)
		{
			if (string.IsNullOrWhiteSpace(Data.NOMBRE_SEGURO_SOCIAL))
			{
				return ValidationError("Debe ingresar el nombre del seguro social.");
			}

			if (Data.NOMBRE_SEGURO_SOCIAL.Trim().Length > 150)
			{
				return ValidationError("El nombre del seguro social no puede superar 150 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_CORTO_SEGURO))
			{
				return ValidationError("Debe ingresar el nombre corto del seguro social.");
			}

			if (Data.NOMBRE_CORTO_SEGURO.Trim().Length > 50)
			{
				return ValidationError("El nombre corto no puede superar 50 caracteres.");
			}

			return null;
		}

		private static CResult ValidationError(string message)
		{
			return new CResult
			{
				Result = false,
				ErrorCode = 400,
				ErrorMessage = message,
			};
		}
	}
}
