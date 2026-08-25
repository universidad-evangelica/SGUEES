using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_EXPEDIENTE_CANDIDATOService : ISC_EXPEDIENTE_CANDIDATOService
	{
		private readonly ISC_EXPEDIENTE_CANDIDATORepository _repo;

		public SC_EXPEDIENTE_CANDIDATOService(ISC_EXPEDIENTE_CANDIDATORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere)
		{
			return await _repo.GetAllAsync(BuildParameters(xWhere));
		}

		public async Task<CResult> GetAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			if (Data.FECHA_GENERACION == default)
			{
				Data.FECHA_GENERACION = System.DateTime.Now;
			}

			Data.ACTIVO = true;
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
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

			if (Data.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("No se pudo identificar el expediente a actualizar.");
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetEstadoAsociacionAsync(SC_EXPEDIENTE_ASOCIARParam Data)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data.CORR_SOLICITUD_EMPLEO <= 0)
			{
				return ValidationError("Debe indicar la solicitud de empleo.");
			}

			return await _repo.GetEstadoAsociacionAsync(Data.CORR_EMPRESA, Data.CORR_SOLICITUD_EMPLEO);
		}

		public async Task<CResult> AsociarSolicitudAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var empresaError = ValidateEmpresaSesion(Data.CORR_EMPRESA);
			if (empresaError != null)
			{
				return empresaError;
			}

			if (Data.CORR_SOLICITUD_EMPLEO <= 0)
			{
				return ValidationError("Debe indicar la solicitud de empleo.");
			}

			return await _repo.AsociarSolicitudAsync(
				Data.CORR_EMPRESA,
				Data.CORR_SOLICITUD_EMPLEO,
				Data.CREAR_EXPEDIENTE,
				vLOGIN_SISTEMA,
				vESTACION);
		}

		private static List<CParameter> BuildParameters(SC_EXPEDIENTE_CANDIDATOParam xWhere)
		{
			return new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
		}

		private static CResult Validate(SC_EXPEDIENTE_CANDIDATOTable Data)
		{
			if (Data == null)
			{
				return ValidationError("No se recibieron datos del expediente.");
			}

			if (Data.CORR_PERSONA_DATOS <= 0)
			{
				return ValidationError("Debe indicar la persona (CORR_PERSONA_DATOS).");
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
				ErrorMessage = "No se pudo continuar porque su usuario no tiene una empresa asignada.",
				ErrorSource = "[SC_EXPEDIENTE_CANDIDATOService]",
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
				ErrorSource = "[SC_EXPEDIENTE_CANDIDATOService]",
				RowsAffected = 0
			};
		}
	}
}
