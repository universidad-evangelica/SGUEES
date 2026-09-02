using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_EXPEDIENTE_SOLICITUDService : ISC_EXPEDIENTE_SOLICITUDService
	{
		private readonly ISC_EXPEDIENTE_SOLICITUDRepository _repo;

		public SC_EXPEDIENTE_SOLICITUDService(ISC_EXPEDIENTE_SOLICITUDRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SC_EXPEDIENTE_SOLICITUDParam xWhere)
		{
			if (xWhere.CORR_EXPEDIENTE_CANDIDATO <= 0)
			{
				return ValidationError("Debe indicar el expediente.");
			}

			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SC_EXPEDIENTE_SOLICITUDParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_CANDIDATO", Value = xWhere.CORR_EXPEDIENTE_CANDIDATO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_EXPEDIENTE_SOLICITUD", Value = xWhere.CORR_EXPEDIENTE_SOLICITUD, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_EXPEDIENTE_SOLICITUDTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_SOLICITUD_EMPLEO <= 0)
			{
				return ValidationError("Debe indicar expediente y solicitud de empleo.");
			}

			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_EXPEDIENTE_SOLICITUDTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_SOLICITUD <= 0)
			{
				return ValidationError("No se pudo identificar el detalle a actualizar.");
			}

			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_EXPEDIENTE_SOLICITUDTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data == null || Data.CORR_EXPEDIENTE_CANDIDATO <= 0 || Data.CORR_EXPEDIENTE_SOLICITUD <= 0)
			{
				return ValidationError("No se pudo identificar el detalle a eliminar.");
			}

			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
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
				ErrorSource = "[SC_EXPEDIENTE_SOLICITUDService]",
				RowsAffected = 0
			};
		}
	}
}
