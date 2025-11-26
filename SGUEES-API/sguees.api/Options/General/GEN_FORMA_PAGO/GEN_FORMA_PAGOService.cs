using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class GEN_FORMA_PAGOService: IGEN_FORMA_PAGOService
	{
		private readonly IGEN_FORMA_PAGORepository _repo;
		
		public GEN_FORMA_PAGOService(IGEN_FORMA_PAGORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_FORMA_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_FORMA_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_FORMA_PAGO",Value=xWhere.CORR_FORMA_PAGO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_FORMA_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_FORMA_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_FORMA_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
