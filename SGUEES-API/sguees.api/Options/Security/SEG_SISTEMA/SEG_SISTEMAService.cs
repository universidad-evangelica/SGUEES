using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SEG_SISTEMAService : ISEG_SISTEMAService
	{
		private readonly ISEG_SISTEMARepository _repo;

		public SEG_SISTEMAService(ISEG_SISTEMARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SEG_SISTEMAParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SEG_SISTEMAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = xWhere.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
			};

			return await _repo.GetAsync(p);
		}
	}
}
