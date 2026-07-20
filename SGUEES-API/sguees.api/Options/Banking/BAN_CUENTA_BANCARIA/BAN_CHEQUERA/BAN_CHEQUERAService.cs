using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_CHEQUERAService : IBAN_CHEQUERAService
	{
		private readonly IBAN_CHEQUERARepository _repo;

		public BAN_CHEQUERAService(IBAN_CHEQUERARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_CHEQUERAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_CHEQUERAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CHEQUERA", Value = xWhere.CORR_CHEQUERA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetActivaPorCuentaAsync(BAN_CHEQUERAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetActivaPorCuentaAsync(p);
		}
	}
}
