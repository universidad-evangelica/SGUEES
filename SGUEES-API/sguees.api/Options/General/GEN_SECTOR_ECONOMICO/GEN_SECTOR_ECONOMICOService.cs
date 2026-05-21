using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_SECTOR_ECONOMICOService: IGEN_SECTOR_ECONOMICOService
	{
		private readonly IGEN_SECTOR_ECONOMICORepository _repo;
		
		public GEN_SECTOR_ECONOMICOService(IGEN_SECTOR_ECONOMICORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_SECTOR_ECONOMICOParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_SECTOR_ECONOMICOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_SECTOR_ECONOMICO",Value=xWhere.CORR_SECTOR_ECONOMICO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_SECTOR_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_SECTOR_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_SECTOR_ECONOMICOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
