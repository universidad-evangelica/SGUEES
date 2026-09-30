// Qué hace: capa de servicio del catálogo AFP.
// Cómo lo hace: valida datos y delega CRUD/ActivarInactivar al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class PLA_AFPService : IPLA_AFPService
	{
		private readonly IPLA_AFPRepository _repo;

		public PLA_AFPService(IPLA_AFPRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(PLA_AFPParam xWhere)
		{
			return await _repo.GetAllAsync(new List<CParameter>());
		}

		public async Task<CResult> GetAsync(PLA_AFPParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_AFP", Value = xWhere.CORR_AFP, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(Data);
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = Validate(Data);
			if (validation != null)
			{
				return validation;
			}

			if (Data.CORR_AFP <= 0)
			{
				return ValidationError("No se pudo identificar la AFP a actualizar.");
			}

			NormalizeData(Data);
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(PLA_AFPTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_AFP <= 0)
			{
				return ValidationError("No se pudo identificar la AFP a actualizar.");
			}

			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static void NormalizeData(PLA_AFPTable Data)
		{
			Data.NOMBRE_AFP = (Data.NOMBRE_AFP ?? string.Empty).Trim();
			Data.NOMBRE_CORTO_AFP = (Data.NOMBRE_CORTO_AFP ?? string.Empty).Trim();
			Data.CODIGO_SGVPP = string.IsNullOrWhiteSpace(Data.CODIGO_SGVPP) ? null : Data.CODIGO_SGVPP.Trim();
			Data.INCLUYE_SEPP ??= false;
			Data.ACTIVO_AFP ??= true;
		}

		private static CResult Validate(PLA_AFPTable Data)
		{
			if (string.IsNullOrWhiteSpace(Data.NOMBRE_AFP))
			{
				return ValidationError("Debe ingresar el nombre de la AFP.");
			}

			if (Data.NOMBRE_AFP.Trim().Length > 150)
			{
				return ValidationError("El nombre de la AFP no puede superar 150 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_CORTO_AFP))
			{
				return ValidationError("Debe ingresar el nombre corto de la AFP.");
			}

			if (Data.NOMBRE_CORTO_AFP.Trim().Length > 50)
			{
				return ValidationError("El nombre corto no puede superar 50 caracteres.");
			}

			if (!string.IsNullOrWhiteSpace(Data.CODIGO_SGVPP) && Data.CODIGO_SGVPP.Trim().Length > 5)
			{
				return ValidationError("El código SGVPP no puede superar 5 caracteres.");
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
