using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SEG_MENU_SISTEMAService : ISEG_MENU_SISTEMAService
	{
		private readonly ISEG_MENU_SISTEMARepository _repo;

		public SEG_MENU_SISTEMAService(ISEG_MENU_SISTEMARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SEG_MENU_SISTEMAParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SEG_MENU_SISTEMAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CODIGO_MENU", Value = xWhere.CODIGO_MENU, DbType = System.Data.DbType.String },
			};

			return await _repo.GetAsync(p);
		}
	}
}
