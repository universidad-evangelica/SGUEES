using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class GEN_ESTRUCTURA_TERRITORIALService : IGEN_ESTRUCTURA_TERRITORIALService
	{
		private readonly IGEN_ESTRUCTURA_TERRITORIALRepository _repo;

		public GEN_ESTRUCTURA_TERRITORIALService(IGEN_ESTRUCTURA_TERRITORIALRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllPaisesAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			return await _repo.GetAllPaisesAsync(BuildPaisParameters(xWhere));
		}

		public async Task<CResult> GetDistinctValuesPaisesAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
			{
				return ValidationError("Debe indicar el campo para el filtro de encabezado.");
			}

			return await _repo.GetDistinctValuesPaisesAsync(BuildPaisParameters(xWhere));
		}

		public async Task<CResult> GetPaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetPaisAsync(p);
		}

		public async Task<CResult> CreatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidatePais(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizePais(data);
			var duplicate = await ValidatePaisDuplicatesAsync(data, isUpdate: false);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreatePaisAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> UpdatePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion)
		{
			if (data == null)
			{
				return ValidationError("No se recibieron datos del país.");
			}

			if (data.CORR_PAIS <= 0)
			{
				return ValidationError("Debe indicar el país a modificar.");
			}

			var validation = ValidatePais(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizePais(data);
			var duplicate = await ValidatePaisDuplicatesAsync(data, isUpdate: true);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdatePaisAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> DeletePaisAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeletePaisAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> GetAllDeptosAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			return await _repo.GetAllDeptosAsync(BuildDeptoParameters(xWhere));
		}

		public async Task<CResult> GetDistinctValuesDeptosAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
			{
				return ValidationError("Debe indicar el campo para el filtro de encabezado.");
			}

			return await _repo.GetDistinctValuesDeptosAsync(BuildDeptoParameters(xWhere));
		}

		public async Task<CResult> GetDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam xWhere)
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

			return await _repo.GetDeptoAsync(p);
		}

		public async Task<CResult> CreateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion)
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

			return await _repo.CreateDeptoAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> UpdateDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion)
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

			return await _repo.UpdateDeptoAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> DeleteDeptoAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeleteDeptoAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> GetAllMunicipiosAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			return await _repo.GetAllMunicipiosAsync(BuildMunicipioParameters(xWhere));
		}

		public async Task<CResult> GetDistinctValuesMunicipiosAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
			{
				return ValidationError("Debe indicar el campo para el filtro de encabezado.");
			}

			return await _repo.GetDistinctValuesMunicipiosAsync(BuildMunicipioParameters(xWhere));
		}

		public async Task<CResult> GetMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_DEPTO", Value = xWhere.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = xWhere.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetMunicipioAsync(p);
		}

		public async Task<CResult> CreateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidateMunicipio(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeMunicipio(data);
			var duplicate = await ValidateMunicipioDuplicatesAsync(data, isUpdate: false);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateMunicipioAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> UpdateMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidateMunicipio(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeMunicipio(data);
			var duplicate = await ValidateMunicipioDuplicatesAsync(data, isUpdate: true);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateMunicipioAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> DeleteMunicipioAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeleteMunicipioAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> GetAllDistritosAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			return await _repo.GetAllDistritosAsync(BuildDistritoParameters(xWhere));
		}

		public async Task<CResult> GetDistinctValuesDistritosAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam xWhere)
		{
			var validation = ValidateCorrEmpresa(xWhere.CORR_EMPRESA, "la estructura territorial");
			if (validation != null)
			{
				return validation;
			}

			if (string.IsNullOrWhiteSpace(xWhere.DISTINCT_FIELD))
			{
				return ValidationError("Debe indicar el campo para el filtro de encabezado.");
			}

			return await _repo.GetDistinctValuesDistritosAsync(BuildDistritoParameters(xWhere));
		}

		public async Task<CResult> GetDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam xWhere)
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
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = xWhere.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DISTRITO", Value = xWhere.CORR_DISTRITO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetDistritoAsync(p);
		}

		public async Task<CResult> CreateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidateDistrito(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeDistrito(data);
			var duplicate = await ValidateDistritoDuplicatesAsync(data, isUpdate: false);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.CreateDistritoAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> UpdateDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			var validation = ValidateDistrito(data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeDistrito(data);
			var duplicate = await ValidateDistritoDuplicatesAsync(data, isUpdate: true);
			if (duplicate != null)
			{
				return duplicate;
			}

			return await _repo.UpdateDistritoAsync(data, vLoginSistema, vEstacion);
		}

		public async Task<CResult> DeleteDistritoAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, string vLoginSistema, string vEstacion)
		{
			return await _repo.DeleteDistritoAsync(data, vLoginSistema, vEstacion);
		}

		private static void NormalizePais(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			data.NOMBRE_PAIS = data.NOMBRE_PAIS?.Trim();
			data.CODIGO_PAIS = data.CODIGO_PAIS?.Trim();
			data.NACIONALIDAD = data.NACIONALIDAD?.Trim();
			data.NOMBRE_CORTO = data.NOMBRE_CORTO?.Trim();
		}

		private static void NormalizeDepto(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
		{
			data.NOMBRE_DEPTO = data.NOMBRE_DEPTO?.Trim();
			data.CODIGO_DEPTO = data.CODIGO_DEPTO?.Trim();
		}

		private static void NormalizeMunicipio(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
		{
			data.NOMBRE_MUNICIPIO = data.NOMBRE_MUNICIPIO?.Trim();
			data.CODIGO_MUNICIPIO = data.CODIGO_MUNICIPIO?.Trim();
		}

		private static void NormalizeDistrito(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
		{
			data.NOMBRE_DISTRITO = data.NOMBRE_DISTRITO?.Trim();
		}

		private static CResult ValidatePais(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data)
		{
			if (data == null)
			{
				return ValidationError("No se recibieron datos del país.");
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE_CORTO))
			{
				return ValidationError("Debe ingresar el nombre corto.");
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE_PAIS))
			{
				return ValidationError("Debe ingresar el nombre del país.");
			}

			if (string.IsNullOrWhiteSpace(data.NACIONALIDAD))
			{
				return ValidationError("Debe ingresar la nacionalidad.");
			}

			if (string.IsNullOrWhiteSpace(data.CODIGO_PAIS))
			{
				return ValidationError("Debe ingresar el código del país.");
			}

			if (data.NOMBRE_PAIS.Trim().Length > 100)
			{
				return ValidationError("El nombre del país no puede superar 100 caracteres.");
			}

			if (!string.IsNullOrWhiteSpace(data.NOMBRE_CORTO) && data.NOMBRE_CORTO.Trim().Length > 5)
			{
				return ValidationError("El nombre corto no puede superar 5 caracteres.");
			}

			return null;
		}

		private static CResult ValidateDepto(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data)
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

		private static CResult ValidateMunicipio(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data)
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

		private static CResult ValidateDistrito(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data)
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
				ErrorSource = "[GEN_ESTRUCTURA_TERRITORIALService]",
				RowsAffected = 0
			};
		}

		private async Task<CResult> ValidatePaisDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_PAISTable data, bool isUpdate)
		{
			var excludeCorrPais = isUpdate ? data.CORR_PAIS : 0;

			if (await _repo.ExistsPaisByFieldAsync("NOMBRE_CORTO", NormalizeText(data.NOMBRE_CORTO), excludeCorrPais))
			{
				return DuplicateWarning("El nombre corto ingresado ya está registrado. Escriba otro nombre corto para continuar.");
			}
			if (await _repo.ExistsPaisByFieldAsync("NOMBRE_PAIS", NormalizeText(data.NOMBRE_PAIS), excludeCorrPais))
			{
				return DuplicateWarning("El nombre de país ingresado ya está registrado. Escriba otro nombre para continuar.");
			}
			if (await _repo.ExistsPaisByFieldAsync("NACIONALIDAD", NormalizeText(data.NACIONALIDAD), excludeCorrPais))
			{
				return DuplicateWarning("La nacionalidad ingresada ya está registrada. Escriba otra nacionalidad para continuar.");
			}
			if (await _repo.ExistsPaisByFieldAsync("CODIGO_PAIS", NormalizeText(data.CODIGO_PAIS), excludeCorrPais))
			{
				return DuplicateWarning("El código de país ingresado ya está registrado. Escriba otro código para continuar.");
			}

			return null;
		}

		private async Task<CResult> ValidateDeptoDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, bool isUpdate)
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

		private async Task<CResult> ValidateMunicipioDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, bool isUpdate)
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

		private async Task<CResult> ValidateDistritoDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, bool isUpdate)
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
				ErrorSource = "[GEN_ESTRUCTURA_TERRITORIALService]",
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
				ErrorSource = "[GEN_ESTRUCTURA_TERRITORIALService]",
				RowsAffected = 0
			};
		}

		private static List<CParameter> BuildPaisParameters(GEN_ESTRUCTURA_TERRITORIAL_PAISParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "DISTINCT_FIELD", Value = xWhere.DISTINCT_FIELD, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "HEADER_FILTER_SEARCH", Value = xWhere.HEADER_FILTER_SEARCH, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "SORT_FIELD", Value = xWhere.SORT_FIELD, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "SORT_DESC", Value = xWhere.SORT_DESC, DbType = System.Data.DbType.Boolean },
			};

			AppendJsonParameter(p, "FILTER_ROW_JSON", xWhere.FILTER_ROW_JSON);
			AppendJsonParameter(p, "COLUMN_EXACT_JSON", xWhere.COLUMN_EXACT_JSON);
			AppendJsonParameter(p, "COLUMN_ANYOF_JSON", xWhere.COLUMN_ANYOF_JSON);
			AppendAnyOfFilters(p, xWhere.COLUMN_ANYOF_JSON);
			return p;
		}

		private static List<CParameter> BuildDeptoParameters(GEN_ESTRUCTURA_TERRITORIAL_DEPTOParam xWhere)
		{
			var p = BuildScopedRemoteParameters(xWhere.BUSQUEDA, xWhere.DISTINCT_FIELD, xWhere.HEADER_FILTER_SEARCH, xWhere.FILTER_ROW_JSON, xWhere.COLUMN_EXACT_JSON, xWhere.COLUMN_ANYOF_JSON, xWhere.SORT_FIELD, xWhere.SORT_DESC);
			if (xWhere.CORR_PAIS > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 });
			}

			return p;
		}

		private static List<CParameter> BuildMunicipioParameters(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOParam xWhere)
		{
			var p = BuildScopedRemoteParameters(xWhere.BUSQUEDA, xWhere.DISTINCT_FIELD, xWhere.HEADER_FILTER_SEARCH, xWhere.FILTER_ROW_JSON, xWhere.COLUMN_EXACT_JSON, xWhere.COLUMN_ANYOF_JSON, xWhere.SORT_FIELD, xWhere.SORT_DESC);
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

		private static List<CParameter> BuildDistritoParameters(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOParam xWhere)
		{
			var p = BuildScopedRemoteParameters(xWhere.BUSQUEDA, xWhere.DISTINCT_FIELD, xWhere.HEADER_FILTER_SEARCH, xWhere.FILTER_ROW_JSON, xWhere.COLUMN_EXACT_JSON, xWhere.COLUMN_ANYOF_JSON, xWhere.SORT_FIELD, xWhere.SORT_DESC);
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

		private static List<CParameter> BuildScopedRemoteParameters(
			string busqueda,
			string distinctField,
			string headerFilterSearch,
			string filterRowJson,
			string columnExactJson,
			string columnAnyOfJson,
			string sortField,
			bool? sortDesc)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "BUSQUEDA", Value = busqueda, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "DISTINCT_FIELD", Value = distinctField, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "HEADER_FILTER_SEARCH", Value = headerFilterSearch, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "SORT_FIELD", Value = sortField, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "SORT_DESC", Value = sortDesc, DbType = System.Data.DbType.Boolean },
			};

			AppendJsonParameter(p, "FILTER_ROW_JSON", filterRowJson);
			AppendJsonParameter(p, "COLUMN_EXACT_JSON", columnExactJson);
			AppendJsonParameter(p, "COLUMN_ANYOF_JSON", columnAnyOfJson);
			AppendAnyOfFilters(p, columnAnyOfJson);
			return p;
		}

		private static void AppendJsonParameter(List<CParameter> p, string parameterName, string json)
		{
			if (string.IsNullOrWhiteSpace(json))
			{
				return;
			}

			p.Add(new CParameter()
			{
				ParameterName = parameterName,
				Value = json,
				DbType = System.Data.DbType.String,
			});
		}

		private static void AppendAnyOfFilters(List<CParameter> p, string columnAnyOfJson)
		{
			if (string.IsNullOrWhiteSpace(columnAnyOfJson))
			{
				return;
			}

			try
			{
				var filters = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(columnAnyOfJson);
				if (filters == null)
				{
					return;
				}

				foreach (var filter in filters)
				{
					if (filter.Value.ValueKind != JsonValueKind.Array)
					{
						continue;
					}

					var values = filter.Value
						.EnumerateArray()
						.Select(x => x.ValueKind switch
						{
							JsonValueKind.String => x.GetString(),
							JsonValueKind.Number => x.GetRawText(),
							JsonValueKind.True => "true",
							JsonValueKind.False => "false",
							JsonValueKind.Null => "__BLANK__",
							_ => x.ToString(),
						})
						.Where(x => !string.IsNullOrWhiteSpace(x))
						.ToList();

					if (values.Count == 0)
					{
						continue;
					}

					p.Add(new CParameter()
					{
						ParameterName = $"{filter.Key}_ANYOF",
						Value = string.Join('|', values),
						DbType = System.Data.DbType.String,
					});
				}
			}
			catch (JsonException)
			{
			}
		}
	}
}
