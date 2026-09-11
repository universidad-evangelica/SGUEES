using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	// Qué hace: orquesta el mtto de niveles de centro de costo.
	// Cómo lo hace: asigna NIVEL autoincremental al crear; en update solo cambia el nombre.
	public class CON_CENTRO_COSTO_NIVELService : ICON_CENTRO_COSTO_NIVELService
	{
		private readonly ICON_CENTRO_COSTO_NIVELRepository _repo;
		public CON_CENTRO_COSTO_NIVELService(ICON_CENTRO_COSTO_NIVELRepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_CENTRO_COSTO_NIVELParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_CENTRO_COSTO_NIVELParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CENTRO_COSTO_NIVEL",Value=xWhere.CORR_CENTRO_COSTO_NIVEL,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		// Qué hace: crea un nivel nuevo con número autoincremental.
		// Cómo lo hace: valida nombre, asigna GetNextNivelAsync y verifica unicidad de nombre.
		public async Task<CResult> CreateAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = ValidateNombre(Data);
			if (validation != null)
			{
				return validation;
			}

			NormalizeData(Data);
			Data.NIVEL = await _repo.GetNextNivelAsync(Data.CORR_EMPRESA);

			var duplicateNombre = await ValidateUniqueNombreAsync(Data, 0);
			if (duplicateNombre != null)
			{
				return duplicateNombre;
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: actualiza solo el nombre del nivel (NIVEL no cambia).
		// Cómo lo hace: valida nombre/unicidad y llama UpdateAsync del repositorio.
		public async Task<CResult> UpdateAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var validation = ValidateNombre(Data);
			if (validation != null)
			{
				return validation;
			}

			if (Data.CORR_CENTRO_COSTO_NIVEL <= 0)
			{
				return ValidationError("No se pudo identificar el nivel de centro de costo a actualizar.");
			}

			NormalizeData(Data);

			var duplicateNombre = await ValidateUniqueNombreAsync(Data, Data.CORR_CENTRO_COSTO_NIVEL);
			if (duplicateNombre != null)
			{
				return duplicateNombre;
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		private static void NormalizeData(CON_CENTRO_COSTO_NIVELTable Data)
		{
			Data.NOMBRE_NIVEL = Data.NOMBRE_NIVEL?.Trim();
		}

		// Qué hace: valida el nombre obligatorio del nivel.
		private static CResult ValidateNombre(CON_CENTRO_COSTO_NIVELTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del nivel de centro de costo.");
			}

			if (string.IsNullOrWhiteSpace(Data.NOMBRE_NIVEL))
			{
				return ValidationError("Debe ingresar el nombre del nivel.");
			}

			if (Data.NOMBRE_NIVEL.Trim().Length > 30)
			{
				return ValidationError("El nombre del nivel no puede superar 30 caracteres.");
			}

			return null;
		}

		private async Task<CResult> ValidateUniqueNombreAsync(CON_CENTRO_COSTO_NIVELTable Data, int excludeCorr)
		{
			var exists = await _repo.ExistsNombreAsync(Data.CORR_EMPRESA, Data.NOMBRE_NIVEL, excludeCorr);
			if (!exists)
			{
				return null;
			}

			var nombre = (Data.NOMBRE_NIVEL ?? string.Empty).Trim();
			return DuplicateWarning(
				$"Ya existe un nivel con el nombre {nombre}. Escriba otro nombre para continuar.");
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
				ErrorSource = "[CON_CENTRO_COSTO_NIVELService]",
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
				ErrorSource = "[CON_CENTRO_COSTO_NIVELService]",
				RowsAffected = 0
			};
		}
	}
}
