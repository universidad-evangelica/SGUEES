using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_SECTORService : IGEN_SECTORService
	{
		private readonly IGEN_SECTORRepository _repo;

		public GEN_SECTORService(IGEN_SECTORRepository repo)
		{
			_repo = repo;
		}

		public Task<CResult> GetAllAsync(GEN_SECTORParam xWhere)
		{
			var parameters = new List<CParameter>
			{
				new CParameter { ParameterName = "CORR_SECTOR", Value = xWhere.CORR_SECTOR, DbType = System.Data.DbType.Int32 },
			};
			return _repo.GetAllAsync(parameters);
		}
	}
}
