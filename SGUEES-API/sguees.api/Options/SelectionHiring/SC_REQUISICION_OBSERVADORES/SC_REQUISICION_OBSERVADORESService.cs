using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SC_REQUISICION_OBSERVADORESService: ISC_REQUISICION_OBSERVADORESService
	{
		private readonly ISC_REQUISICION_OBSERVADORESRepository _repo;
		
		public SC_REQUISICION_OBSERVADORESService(ISC_REQUISICION_OBSERVADORESRepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(SC_REQUISICION_OBSERVADORESParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(SC_REQUISICION_OBSERVADORESParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(SC_REQUISICION_OBSERVADORESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
