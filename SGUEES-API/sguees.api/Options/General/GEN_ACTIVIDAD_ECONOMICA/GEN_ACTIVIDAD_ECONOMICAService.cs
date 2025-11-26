using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class GEN_ACTIVIDAD_ECONOMICAService: IGEN_ACTIVIDAD_ECONOMICAService
	{
		private readonly IGEN_ACTIVIDAD_ECONOMICARepository _repo;
		
		public GEN_ACTIVIDAD_ECONOMICAService(IGEN_ACTIVIDAD_ECONOMICARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_ACTIVIDAD_ECONOMICAParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_ACTIVIDAD_ECONOMICAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_ACTIVIDAD_ECONOMICA",Value=xWhere.CORR_ACTIVIDAD_ECONOMICA,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
