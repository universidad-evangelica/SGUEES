using System.Collections.Generic;
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

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "PAGE", Value = xWhere.PAGE, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "PAGE_SIZE", Value = xWhere.PAGE_SIZE, DbType = System.Data.DbType.Int32 },
			};

			AddColumnFilter("CORR_PAIS", xWhere.CORR_PAIS, System.Data.DbType.Int32);
			AddColumnFilter("NOMBRE_PAIS", xWhere.NOMBRE_PAIS, System.Data.DbType.String);
			AddColumnFilter("CODIGO_PAIS", xWhere.CODIGO_PAIS, System.Data.DbType.String);
			AddColumnFilter("NACIONALIDAD", xWhere.NACIONALIDAD, System.Data.DbType.String);
			AddColumnFilter("NOMBRE_CORTO", xWhere.NOMBRE_CORTO, System.Data.DbType.String);

			return await _repo.GetAllPaisesAsync(p);

			void AddColumnFilter(string parameterName, object value, System.Data.DbType dbType)
			{
				if (value == null ||
					value is string text && string.IsNullOrWhiteSpace(text) ||
					value is int number && number <= 0)
				{
					return;
				}

				p.Add(new CParameter() { ParameterName = parameterName, Value = value, DbType = dbType });
			}
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

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
			};

			if (xWhere.CORR_PAIS > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 });
			}

			AddColumnFilter("CORR_DEPTO", xWhere.CORR_DEPTO, System.Data.DbType.Int32);
			AddColumnFilter("NOMBRE_DEPTO", xWhere.NOMBRE_DEPTO, System.Data.DbType.String);
			AddColumnFilter("CODIGO_DEPTO", xWhere.CODIGO_DEPTO, System.Data.DbType.String);

			return await _repo.GetAllDeptosAsync(p);

			void AddColumnFilter(string parameterName, object value, System.Data.DbType dbType)
			{
				if (value == null ||
					value is string text && string.IsNullOrWhiteSpace(text) ||
					value is int number && number <= 0)
				{
					return;
				}

				p.Add(new CParameter() { ParameterName = parameterName, Value = value, DbType = dbType });
			}
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

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
			};

			if (xWhere.CORR_PAIS > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_PAIS", Value = xWhere.CORR_PAIS, DbType = System.Data.DbType.Int32 });
			}

			if (xWhere.CORR_DEPTO > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_DEPTO", Value = xWhere.CORR_DEPTO, DbType = System.Data.DbType.Int32 });
			}

			AddColumnFilter("CORR_MUNICIPIO", xWhere.CORR_MUNICIPIO, System.Data.DbType.Int32);
			AddColumnFilter("NOMBRE_MUNICIPIO", xWhere.NOMBRE_MUNICIPIO, System.Data.DbType.String);
			AddColumnFilter("CODIGO_MUNICIPIO", xWhere.CODIGO_MUNICIPIO, System.Data.DbType.String);

			return await _repo.GetAllMunicipiosAsync(p);

			void AddColumnFilter(string parameterName, object value, System.Data.DbType dbType)
			{
				if (value == null ||
					value is string text && string.IsNullOrWhiteSpace(text) ||
					value is int number && number <= 0)
				{
					return;
				}

				p.Add(new CParameter() { ParameterName = parameterName, Value = value, DbType = dbType });
			}
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

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "BUSQUEDA", Value = xWhere.BUSQUEDA, DbType = System.Data.DbType.String },
			};

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

			AddColumnFilter("CORR_DISTRITO", xWhere.CORR_DISTRITO, System.Data.DbType.Int32);
			AddColumnFilter("NOMBRE_DISTRITO", xWhere.NOMBRE_DISTRITO, System.Data.DbType.String);

			return await _repo.GetAllDistritosAsync(p);

			void AddColumnFilter(string parameterName, object value, System.Data.DbType dbType)
			{
				if (value == null ||
					value is string text && string.IsNullOrWhiteSpace(text) ||
					value is int number && number <= 0)
				{
					return;
				}

				p.Add(new CParameter() { ParameterName = parameterName, Value = value, DbType = dbType });
			}
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

			if (string.IsNullOrWhiteSpace(data.NOMBRE_PAIS))
			{
				return ValidationError("Debe ingresar el nombre del país.");
			}

			if (string.IsNullOrWhiteSpace(data.CODIGO_PAIS))
			{
				return ValidationError("Debe ingresar el código del país.");
			}

			if (string.IsNullOrWhiteSpace(data.NACIONALIDAD))
			{
				return ValidationError("Debe ingresar la nacionalidad.");
			}

			if (string.IsNullOrWhiteSpace(data.NOMBRE_CORTO))
			{
				return ValidationError("Debe ingresar el nombre corto.");
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
			var result = await _repo.GetAllPaisesAsync(BuildPagingParams());
			var rows = ExtractRows<GEN_ESTRUCTURA_TERRITORIAL_PAISView>(result);
			if (rows.Count == 0)
			{
				return null;
			}

			var others = rows.Where(x => !isUpdate || x.CORR_PAIS != data.CORR_PAIS).ToList();
			if (others.Any(x => NormalizeText(x.NOMBRE_PAIS) == NormalizeText(data.NOMBRE_PAIS)))
			{
				return DuplicateWarning("El nombre de país ingresado ya está registrado. Escriba otro nombre para continuar.");
			}
			if (others.Any(x => NormalizeText(x.CODIGO_PAIS) == NormalizeText(data.CODIGO_PAIS)))
			{
				return DuplicateWarning("El código de país ingresado ya está registrado. Escriba otro código para continuar.");
			}
			if (others.Any(x => NormalizeText(x.NACIONALIDAD) == NormalizeText(data.NACIONALIDAD)))
			{
				return DuplicateWarning("La nacionalidad ingresada ya está registrada. Escriba otra nacionalidad para continuar.");
			}
			if (others.Any(x => NormalizeText(x.NOMBRE_CORTO) == NormalizeText(data.NOMBRE_CORTO)))
			{
				return DuplicateWarning("El nombre corto ingresado ya está registrado. Escriba otro nombre corto para continuar.");
			}

			return null;
		}

		private async Task<CResult> ValidateDeptoDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_DEPTOTable data, bool isUpdate)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
			};
			var result = await _repo.GetAllDeptosAsync(p);
			var rows = ExtractRows<GEN_ESTRUCTURA_TERRITORIAL_DEPTOView>(result);
			var others = rows.Where(x => !isUpdate || x.CORR_PAIS != data.CORR_PAIS || x.CORR_DEPTO != data.CORR_DEPTO).ToList();

			if (others.Any(x => NormalizeText(x.NOMBRE_DEPTO) == NormalizeText(data.NOMBRE_DEPTO)))
			{
				return DuplicateWarning("El nombre de departamento ingresado ya está registrado. Escriba otro nombre para continuar.");
			}
			if (others.Any(x => NormalizeText(x.CODIGO_DEPTO) == NormalizeText(data.CODIGO_DEPTO)))
			{
				return DuplicateWarning("El código de departamento ingresado ya está registrado. Escriba otro código para continuar.");
			}

			return null;
		}

		private async Task<CResult> ValidateMunicipioDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOTable data, bool isUpdate)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
			};
			var result = await _repo.GetAllMunicipiosAsync(p);
			var rows = ExtractRows<GEN_ESTRUCTURA_TERRITORIAL_MUNICIPIOView>(result);
			var others = rows.Where(x =>
				!isUpdate ||
				x.CORR_PAIS != data.CORR_PAIS ||
				x.CORR_DEPTO != data.CORR_DEPTO ||
				x.CORR_MUNICIPIO != data.CORR_MUNICIPIO).ToList();

			if (others.Any(x => NormalizeText(x.NOMBRE_MUNICIPIO) == NormalizeText(data.NOMBRE_MUNICIPIO)))
			{
				return DuplicateWarning("El nombre de municipio ingresado ya está registrado. Escriba otro nombre para continuar.");
			}
			if (others.Any(x => NormalizeText(x.CODIGO_MUNICIPIO) == NormalizeText(data.CODIGO_MUNICIPIO)))
			{
				return DuplicateWarning("El código de municipio ingresado ya está registrado. Escriba otro código para continuar.");
			}

			return null;
		}

		private async Task<CResult> ValidateDistritoDuplicatesAsync(GEN_ESTRUCTURA_TERRITORIAL_DISTRITOTable data, bool isUpdate)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PAIS", Value = data.CORR_PAIS, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPTO", Value = data.CORR_DEPTO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_MUNICIPIO", Value = data.CORR_MUNICIPIO, DbType = System.Data.DbType.Int32 },
			};
			var result = await _repo.GetAllDistritosAsync(p);
			var rows = ExtractRows<GEN_ESTRUCTURA_TERRITORIAL_DISTRITOView>(result);
			var others = rows.Where(x =>
				!isUpdate ||
				x.CORR_PAIS != data.CORR_PAIS ||
				x.CORR_DEPTO != data.CORR_DEPTO ||
				x.CORR_MUNICIPIO != data.CORR_MUNICIPIO ||
				x.CORR_DISTRITO != data.CORR_DISTRITO).ToList();

			if (others.Any(x => NormalizeText(x.NOMBRE_DISTRITO) == NormalizeText(data.NOMBRE_DISTRITO)))
			{
				return DuplicateWarning("El nombre de distrito ingresado ya está registrado. Escriba otro nombre para continuar.");
			}

			return null;
		}

		private static List<CParameter> BuildPagingParams()
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "PAGE", Value = 1, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "PAGE_SIZE", Value = 500, DbType = System.Data.DbType.Int32 },
			};
		}

		private static List<TView> ExtractRows<TView>(CResult result)
		{
			if (result?.Result != true || result.Data == null)
			{
				return new List<TView>();
			}

			if (result.Data is List<TView> typedRows)
			{
				return typedRows;
			}

			if (result.Data is IEnumerable<TView> rows)
			{
				return rows.ToList();
			}

			return new List<TView>();
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
	}
}
