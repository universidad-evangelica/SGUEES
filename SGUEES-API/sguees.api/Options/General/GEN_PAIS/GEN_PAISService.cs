using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PAISService: IGEN_PAISService
	{
		private readonly IGEN_PAISRepository _repo;
		
		public GEN_PAISService(IGEN_PAISRepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_PAISParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_PAISParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CODIGO_PAIS",Value=xWhere.CODIGO_PAIS,DbType=System.Data.DbType.String},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_PAISTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
