using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;
using SGUEES.Repositories;

namespace SGUEES.Services
{
	public class SC_TIPO_MODALIDADService: ISC_TIPO_MODALIDADService
	{
		private readonly ISC_TIPO_MODALIDADRepository _repo;
		
		public SC_TIPO_MODALIDADService(ISC_TIPO_MODALIDADRepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(SC_TIPO_MODALIDADParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(SC_TIPO_MODALIDADParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(SC_TIPO_MODALIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(SC_TIPO_MODALIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(SC_TIPO_MODALIDADTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
