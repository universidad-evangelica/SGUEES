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

		public async Task<CResult> GetAllAsync(GEN_DIVISIONParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetDivisionesAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetDivisionesAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DIVISION", Value = xWhere.CORR_DIVISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

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

		public async Task<CResult> DeleteAsync(GEN_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(GEN_DIVISIONParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

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
