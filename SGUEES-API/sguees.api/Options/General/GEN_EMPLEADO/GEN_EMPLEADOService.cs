using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_EMPLEADOService : IGEN_EMPLEADOService
	{
		private readonly IGEN_EMPLEADORepository _repo;

		public GEN_EMPLEADOService(IGEN_EMPLEADORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPLEADO", Value = xWhere.CORR_EMPLEADO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}
	}
}
