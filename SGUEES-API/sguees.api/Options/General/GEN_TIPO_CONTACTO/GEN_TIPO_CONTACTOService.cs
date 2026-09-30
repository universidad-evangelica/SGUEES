// Qué hace: capa de servicio del catálogo tipo contacto.
// Cómo lo hace: arma parámetros CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_TIPO_CONTACTOService : IGEN_TIPO_CONTACTOService
	{
		private readonly IGEN_TIPO_CONTACTORepository _repo;

		public GEN_TIPO_CONTACTOService(IGEN_TIPO_CONTACTORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_TIPO_CONTACTOParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_TIPO_CONTACTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_TIPO_CONTACTO", Value = xWhere.CORR_TIPO_CONTACTO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var error = ValidarListas(Data);
			if (error != null)
			{
				return error;
			}

			var duplicado = await ValidarNombreCortoUnicoAsync(Data, isUpdate: false);
			if (duplicado != null)
			{
				return duplicado;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var error = ValidarListas(Data);
			if (error != null)
			{
				return error;
			}

			var duplicado = await ValidarNombreCortoUnicoAsync(Data, isUpdate: true);
			if (duplicado != null)
			{
				return duplicado;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_TIPO_CONTACTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: rechaza un nombre corto que ya existe en otro tipo de contacto.
		// Cómo lo hace: compara en mayúsculas y excluye el correlativo cuando es edición.
		private async Task<CResult> ValidarNombreCortoUnicoAsync(GEN_TIPO_CONTACTOTable Data, bool isUpdate)
		{
			Data.NOMBRE_CORTO = (Data.NOMBRE_CORTO ?? string.Empty).Trim();
			var excludeCorr = isUpdate ? Data.CORR_TIPO_CONTACTO : 0;
			var corto = Data.NOMBRE_CORTO.ToUpperInvariant();

			if (await _repo.ExistsNombreCortoAsync(corto, excludeCorr))
			{
				return new CResult
				{
					Data = null,
					Result = false,
					CodeHelper = 0,
					ErrorCode = 2627,
					ErrorMessage = "El nombre corto ingresado ya está registrado. Escriba otro nombre corto para continuar.",
					ErrorSource = "[GEN_TIPO_CONTACTOService]",
					RowsAffected = 0
				};
			}

			return null;
		}

		// Qué hace: exige FORMATO_CARACTERES y APLICA_PARA dentro del CHECK de la tabla.
		// Cómo lo hace: normaliza al Key oficial; vacío o fuera de lista se rechaza ('' viola el CHECK).
		private static CResult ValidarListas(GEN_TIPO_CONTACTOTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del tipo de contacto.");
			}

			var formato = NormalizeFormatoCaracteres(Data.FORMATO_CARACTERES);
			if (formato == null)
			{
				return ValidationError("Formato de caracteres inválido. Use LETRAS, NUMEROS o AMBOS.");
			}

			var aplica = NormalizeAplicaPara(Data.APLICA_PARA);
			if (aplica == null)
			{
				return ValidationError("Aplica para inválido. Use NACIONALES, EXTRANJEROS o AMBOS.");
			}

			Data.FORMATO_CARACTERES = formato;
			Data.APLICA_PARA = aplica;
			return null;
		}

		// Qué hace: normaliza FORMATO_CARACTERES al valor del CHECK de BD.
		// Cómo lo hace: acepta keys oficiales y el texto visible de la lista.
		private static string NormalizeFormatoCaracteres(string value)
		{
			var v = (value ?? string.Empty).Trim().ToUpperInvariant();
			return v switch
			{
				"NUMEROS" or "SOLO NÚMEROS" or "SOLO NUMEROS" => "NUMEROS",
				"LETRAS" or "SOLO LETRAS" => "LETRAS",
				"AMBOS" or "LETRAS Y NÚMEROS" or "LETRAS Y NUMEROS" => "AMBOS",
				_ => null
			};
		}

		// Qué hace: normaliza APLICA_PARA al valor del CHECK de BD.
		// Cómo lo hace: acepta NACIONALES, EXTRANJEROS, AMBOS y el texto visible.
		private static string NormalizeAplicaPara(string value)
		{
			var v = (value ?? string.Empty).Trim().ToUpperInvariant();
			return v switch
			{
				"NACIONALES" or "NACIONAL" => "NACIONALES",
				"EXTRANJEROS" or "EXTRANJERO" => "EXTRANJEROS",
				"AMBOS" => "AMBOS",
				_ => null
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
				ErrorSource = "[GEN_TIPO_CONTACTOService]",
				RowsAffected = 0
			};
		}
	}
}
