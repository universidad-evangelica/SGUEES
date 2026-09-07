using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class PLA_TIPO_DOCUMENTO_ADJUNTOService : IPLA_TIPO_DOCUMENTO_ADJUNTOService
	{
		private readonly IPLA_TIPO_DOCUMENTO_ADJUNTORepository _repo;

		public PLA_TIPO_DOCUMENTO_ADJUNTOService(IPLA_TIPO_DOCUMENTO_ADJUNTORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(PLA_TIPO_DOCUMENTO_ADJUNTOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetAsync(PLA_TIPO_DOCUMENTO_ADJUNTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_TIPO_DOCUMENTO_ADJUNTO", Value = xWhere.CORR_TIPO_DOCUMENTO_ADJUNTO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			NormalizeData(Data);
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			if (Data.CORR_TIPO_DOCUMENTO_ADJUNTO <= 0)
			{
				return ValidationError("No se pudo identificar el tipo de documento adjunto a actualizar.");
			}

			NormalizeData(Data);
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		private static List<CParameter> BuildParameters(PLA_TIPO_DOCUMENTO_ADJUNTOParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		private static void NormalizeData(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			Data.TIPO_DOCUMENTO = Data.TIPO_DOCUMENTO?.Trim();
			Data.DESCRIPCION_DOCUMENTO = Data.DESCRIPCION_DOCUMENTO?.Trim();
		}

		private static CResult Validate(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del tipo de documento adjunto.");
			}

			if (string.IsNullOrWhiteSpace(Data.TIPO_DOCUMENTO))
			{
				return ValidationError("Debe ingresar el tipo de documento.");
			}

			if (Data.TIPO_DOCUMENTO.Trim().Length > 250)
			{
				return ValidationError("El tipo de documento no puede superar 250 caracteres.");
			}

			if (!string.IsNullOrWhiteSpace(Data.DESCRIPCION_DOCUMENTO) && Data.DESCRIPCION_DOCUMENTO.Trim().Length > 500)
			{
				return ValidationError("La descripción del documento no puede superar 500 caracteres.");
			}

			return null;
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
				ErrorMessage = "No se pudo guardar el tipo de documento adjunto porque su usuario no tiene una empresa asignada. Solicite que le configuren una empresa por defecto en el sistema.",
				ErrorSource = "[PLA_TIPO_DOCUMENTO_ADJUNTOService]",
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
				ErrorSource = "[PLA_TIPO_DOCUMENTO_ADJUNTOService]",
				RowsAffected = 0
			};
		}
	}
}
