using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_TIPO_MOVI_BANCARIOService : IBAN_TIPO_MOVI_BANCARIOService
	{
		private readonly IBAN_TIPO_MOVI_BANCARIORepository _repo;
		public BAN_TIPO_MOVI_BANCARIOService(IBAN_TIPO_MOVI_BANCARIORepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(BAN_TIPO_MOVI_BANCARIOParam xWhere)
		{
			var p = new List<CParameter> { new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 } };
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_TIPO_MOVI_BANCARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			Data.ESTADO_TIPO_MOVIMIENTO ??= true;
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ActivarInactivarAsync(BAN_TIPO_MOVI_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_TIPO_MOVIMIENTO <= 0)
			{
				return new CResult
				{
					Data = null,
					Result = false,
					CodeHelper = 0,
					ErrorCode = -1,
					ErrorMessage = "No se pudo identificar el tipo de movimiento a actualizar.",
					ErrorSource = "[BAN_TIPO_MOVI_BANCARIOService]",
					RowsAffected = 0
				};
			}

			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
