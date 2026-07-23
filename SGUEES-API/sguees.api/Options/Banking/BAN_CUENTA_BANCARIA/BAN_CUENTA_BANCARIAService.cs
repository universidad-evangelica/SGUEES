using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_CUENTA_BANCARIAService : IBAN_CUENTA_BANCARIAService
	{
		private readonly IBAN_CUENTA_BANCARIARepository _repo;
		public BAN_CUENTA_BANCARIAService(IBAN_CUENTA_BANCARIARepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(BAN_CUENTA_BANCARIAParam xWhere)
		{
			var p = new List<CParameter> { new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 } };
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_CUENTA_BANCARIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			Data.ESTADO_CUENTA_BANCARIA ??= true;
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ActivarInactivarAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			if (Data.CORR_CUENTA_BANCO <= 0)
			{
				return new CResult
				{
					Data = null,
					Result = false,
					CodeHelper = 0,
					ErrorCode = -1,
					ErrorMessage = "No se pudo identificar la cuenta bancaria a actualizar.",
					ErrorSource = "[BAN_CUENTA_BANCARIAService]",
					RowsAffected = 0
				};
			}

			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
