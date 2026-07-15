using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class GEN_MUNICIPIOService : IGEN_MUNICIPIOService
	{
		private readonly IGEN_MUNICIPIORepository _repo;

		public GEN_MUNICIPIOService(IGEN_MUNICIPIORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_MUNICIPIOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetMunicipiosByCodigoDeptoAsync(GEN_MUNICIPIOParam xWhere)
		{
			if (string.IsNullOrWhiteSpace(xWhere?.CODIGO_DEPTO))
			{
				return await GetAllAsync(xWhere);
			}

			return await _repo.GetMunicipiosByCodigoDeptoAsync(xWhere.CODIGO_DEPTO.Trim());
		}

		public async Task<CResult> GetAsync(GEN_MUNICIPIOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA);
			if (validation != null)
			{
				return validation;
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_DEPTO", Value = xWhere.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = xWhere.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
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

		public async Task<CResult> UpdateAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
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

		public async Task<CResult> DeleteAsync(GEN_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeleteAsync(data, vLoginSistema, vEstacion);
		}

		private static List<CParameter> BuildParameters(GEN_MUNICIPIOParam xWhere)
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

			return p;
		}

		private static void NormalizeData(GEN_MUNICIPIOTable data)
		{
			data.NOMBRE_MUNICIPIO = data.NOMBRE_MUNICIPIO?.Trim();
			data.CODIGO_MUNICIPIO = data.CODIGO_MUNICIPIO?.Trim();
		}

		private static CResult Validate(GEN_MUNICIPIOTable data)
		{
			if (data == null)
			{
				return ValidationError("No se recibieron datos del municipio.");
			}

			if (data.CORR_PAIS <= 0 || data.CORR_DEPTO <= 0)
			{
				return ValidationError("Debe seleccionar un departamento.");
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE_MUNICIPIO))
			{
				return ValidationError("Debe ingresar el nombre del municipio.");
			}

			if (string.IsNullOrWhiteSpace(data.CODIGO_MUNICIPIO))
			{
				return ValidationError("Debe ingresar el código del municipio.");
			}

			return null;
		}

		private async Task<CResult> ValidateDuplicatesAsync(GEN_MUNICIPIOTable data, bool isUpdate)
		{
			var excludeCorrPais = isUpdate ? data.CORR_PAIS : 0;
			var excludeCorrDepto = isUpdate ? data.CORR_DEPTO : 0;
			var excludeCorrMunicipio = isUpdate ? data.CORR_MUNICIPIO : 0;

			if (await _repo.ExistsMunicipioByFieldAsync(
				data.CORR_PAIS,
				data.CORR_DEPTO,
				"NOMBRE_MUNICIPIO",
				NormalizeText(data.NOMBRE_MUNICIPIO),
				excludeCorrPais,
				excludeCorrDepto,
				excludeCorrMunicipio))
			{
				return DuplicateWarning("El nombre de municipio ingresado ya está registrado. Escriba otro nombre para continuar.");
			}

			if (await _repo.ExistsMunicipioByFieldAsync(
				data.CORR_PAIS,
				data.CORR_DEPTO,
				"CODIGO_MUNICIPIO",
				NormalizeText(data.CODIGO_MUNICIPIO),
				excludeCorrPais,
				excludeCorrDepto,
				excludeCorrMunicipio))
			{
				return DuplicateWarning("El código de municipio ingresado ya está registrado. Escriba otro código para continuar.");
			}

			return null;
		}

		private static string NormalizeText(string value)
		{
			return (value ?? string.Empty).Trim().ToUpperInvariant();
		}

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
					"No se pudo guardar el municipio porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[GEN_MUNICIPIOService]",
				RowsAffected = 0
			};
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
				ErrorSource = "[GEN_MUNICIPIOService]",
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
				ErrorSource = "[GEN_MUNICIPIOService]",
				RowsAffected = 0
			};
		}
	}
}
