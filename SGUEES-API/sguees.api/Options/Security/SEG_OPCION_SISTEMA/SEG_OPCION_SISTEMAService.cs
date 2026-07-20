using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SEG_OPCION_SISTEMAService : ISEG_OPCION_SISTEMAService
	{
		private readonly ISEG_OPCION_SISTEMARepository _repo;

		public SEG_OPCION_SISTEMAService(ISEG_OPCION_SISTEMARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SEG_OPCION_SISTEMAParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SEG_OPCION_SISTEMAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CODIGO_OPCION", Value = xWhere.CODIGO_OPCION, DbType = System.Data.DbType.String },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SEG_OPCION_SISTEMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
