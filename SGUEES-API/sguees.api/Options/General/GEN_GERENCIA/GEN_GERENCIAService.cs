using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_GERENCIAService : IGEN_GERENCIAService
	{
		private readonly IGEN_GERENCIARepository _repo;

		public GEN_GERENCIAService(IGEN_GERENCIARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_GERENCIAParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetAsync(GEN_GERENCIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_GERENCIA", Value = xWhere.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

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

		public async Task<CResult> DeleteAsync(GEN_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(GEN_GERENCIAParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

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

		private async Task<CResult> ValidateUniqueCodigoAsync(GEN_GERENCIATable Data, int? excludeCorr)
		{
			var exists = await _repo.ExistsCodigoAsync(
				Data.CORR_EMPRESA,
				Data.CODIGO_GERENCIA,
				excludeCorr ?? 0);

			return exists
				? ValidationError($"Ya existe una gerencia con el codigo {Data.CODIGO_GERENCIA}.")
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
				ErrorMessage = "No se pudo guardar la gerencia porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_GERENCIAService]",
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
				ErrorSource = "[GEN_GERENCIAService]",
				RowsAffected = 0
			};
		}
	}
}
