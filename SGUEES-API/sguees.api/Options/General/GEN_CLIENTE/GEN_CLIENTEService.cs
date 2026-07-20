using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_CLIENTEService : IGEN_CLIENTEService
	{
		private readonly IGEN_CLIENTERepository _repo;

		public GEN_CLIENTEService(IGEN_CLIENTERepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_CLIENTEParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_CLIENTEParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CLIENTE", Value = xWhere.CORR_CLIENTE, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			Data.ESTA_ACTIVO ??= true;
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(GEN_CLIENTETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
