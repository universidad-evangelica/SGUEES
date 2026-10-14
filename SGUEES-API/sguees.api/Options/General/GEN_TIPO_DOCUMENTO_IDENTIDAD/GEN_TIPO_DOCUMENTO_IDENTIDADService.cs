// Qué hace: capa de servicio del catálogo tipo documento identidad.
// Cómo lo hace: valida datos/unicidad (nombre y nombre corto) y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_TIPO_DOCUMENTO_IDENTIDADService : IGEN_TIPO_DOCUMENTO_IDENTIDADService
	{
		private readonly IGEN_TIPO_DOCUMENTO_IDENTIDADRepository _repo;

		public GEN_TIPO_DOCUMENTO_IDENTIDADService(IGEN_TIPO_DOCUMENTO_IDENTIDADRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_TIPO_DOCUMENTO_IDENTIDADParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_TIPO_DOCUMENTO_IDENTIDADParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO_IDENTIDAD", Value = xWhere.CORR_TIPO_DOCUMENTO_IDENTIDAD, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		// Qué hace: crea tipo documento identidad.
		// Cómo: Validate → Normalize → ValidateDuplicates → CreateAsync.
		public async Task<CResult> CreateAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

		// Qué hace: actualiza tipo documento identidad.
		// Cómo: Validate → Normalize → ValidateDuplicates → UpdateAsync.
		public async Task<CResult> UpdateAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del tipo de documento.");
			}

			if (Data.CORR_TIPO_DOCUMENTO_IDENTIDAD <= 0)
			{
				return ValidationError("Debe indicar el tipo de documento a modificar.");
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

		public async Task<CResult> DeleteAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: valida campos obligatorios y longitudes.
		private static CResult Validate(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del tipo de documento.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD))
			{
				return ValidationError("Debe ingresar el nombre del tipo de documento.");
			}

			if (Data.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD.Trim().Length > 25)
			{
				return ValidationError("El nombre no puede superar 25 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_CORTO))
			{
				return ValidationError("Debe ingresar el nombre corto.");
			}

			if (Data.NOMBRE_CORTO.Trim().Length > 15)
			{
				return ValidationError("El nombre corto no puede superar 15 caracteres.");
			}

			if (string.IsNullOrWhiteSpace(Data.FORMATO_CARACTERES))
			{
				return ValidationError("Debe indicar el formato de caracteres.");
			}

			var formato = NormalizeFormatoCaracteres(Data.FORMATO_CARACTERES);
			if (formato == null)
			{
				return ValidationError("Formato de caracteres inválido. Use LETRAS, NUMEROS o AMBOS.");
			}

			if (string.IsNullOrWhiteSpace(Data.APLICA_PARA))
			{
				return ValidationError("Debe indicar si aplica para nacionales, extranjeros o ambos.");
			}

			var aplica = NormalizeAplicaPara(Data.APLICA_PARA);
			if (aplica == null)
			{
				return ValidationError("Aplica para inválido. Use NACIONALES, EXTRANJEROS o AMBOS.");
			}

			if (Data.ACTIVO_CARACTERES == true)
			{
				var n = Data.NUMERO_CARACTERES ?? 0;
				if (n <= 0)
				{
					return ValidationError("Debe indicar el número de caracteres cuando la validación está activa.");
				}
			}

			return null;
		}

		// Qué hace: comprueba unicidad de nombre y nombre corto.
		// Cómo: ExistsByFieldAsync excluyendo el correlativo en edición.
		private async Task<CResult> ValidateDuplicatesAsync(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data, bool isUpdate)
		{
			var excludeCorr = isUpdate ? Data.CORR_TIPO_DOCUMENTO_IDENTIDAD : 0;

			if (await _repo.ExistsByFieldAsync("NOMBRE_CORTO", NormalizeText(Data.NOMBRE_CORTO), excludeCorr))
			{
				return DuplicateWarning("El nombre corto ingresado ya está registrado. Escriba otro nombre corto para continuar.");
			}

			if (await _repo.ExistsByFieldAsync("NOMBRE_TIPO_DOCUMENTO_IDENTIDAD", NormalizeText(Data.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD), excludeCorr))
			{
				return DuplicateWarning("El nombre del tipo de documento ingresado ya está registrado. Escriba otro nombre para continuar.");
			}

			return null;
		}

		private static void NormalizeData(GEN_TIPO_DOCUMENTO_IDENTIDADTable Data)
		{
			Data.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD = (Data.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD ?? string.Empty).Trim();
			Data.NOMBRE_CORTO = (Data.NOMBRE_CORTO ?? string.Empty).Trim();
			Data.FORMATO_CARACTERES = NormalizeFormatoCaracteres(Data.FORMATO_CARACTERES) ?? string.Empty;
			Data.APLICA_PARA = NormalizeAplicaPara(Data.APLICA_PARA) ?? string.Empty;
		}

		// Qué hace: normaliza FORMATO_CARACTERES al valor del CHECK de BD.
		// Cómo: acepta keys oficiales y alias legacy (N/L/A o texto visible).
		private static string NormalizeFormatoCaracteres(string value)
		{
			var v = (value ?? string.Empty).Trim().ToUpperInvariant();
			return v switch
			{
				"NUMEROS" or "N" or "SOLO NÚMEROS" or "SOLO NUMEROS" => "NUMEROS",
				"LETRAS" or "L" or "SOLO LETRAS" => "LETRAS",
				"AMBOS" or "A" or "LETRAS Y NÚMEROS" or "LETRAS Y NUMEROS" => "AMBOS",
				_ => null
			};
		}

		// Qué hace: normaliza APLICA_PARA al valor del CHECK de BD.
		private static string NormalizeAplicaPara(string value)
		{
			var v = (value ?? string.Empty).Trim().ToUpperInvariant();
			return v switch
			{
				"NACIONALES" or "N" or "NACIONAL" => "NACIONALES",
				"EXTRANJEROS" or "E" or "EXTRANJERO" => "EXTRANJEROS",
				"AMBOS" or "A" => "AMBOS",
				_ => null
			};
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
				ErrorSource = "[GEN_TIPO_DOCUMENTO_IDENTIDADService]",
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
				ErrorSource = "[GEN_TIPO_DOCUMENTO_IDENTIDADService]",
				RowsAffected = 0
			};
		}
	}
}
