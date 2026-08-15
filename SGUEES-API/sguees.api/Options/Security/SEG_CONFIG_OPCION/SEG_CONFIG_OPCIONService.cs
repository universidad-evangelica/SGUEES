using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SEG_CONFIG_OPCIONService : ISEG_CONFIG_OPCIONService
	{
		private readonly ISEG_CONFIG_OPCIONRepository _repo;

		public SEG_CONFIG_OPCIONService(ISEG_CONFIG_OPCIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SEG_CONFIG_OPCIONParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SEG_CONFIG_OPCIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CODIGO_SISTEMA", Value = xWhere.CODIGO_SISTEMA, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_MENU", Value = xWhere.CODIGO_MENU, DbType = System.Data.DbType.String },
				new CParameter() { ParameterName = "CODIGO_OPCION", Value = xWhere.CODIGO_OPCION, DbType = System.Data.DbType.String },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SEG_CONFIG_OPCIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
