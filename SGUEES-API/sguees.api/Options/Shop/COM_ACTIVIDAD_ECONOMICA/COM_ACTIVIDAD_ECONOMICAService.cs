using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_ACTIVIDAD_ECONOMICAService: ICOM_ACTIVIDAD_ECONOMICAService
	{
		private readonly ICOM_ACTIVIDAD_ECONOMICARepository _repo;
		
		public COM_ACTIVIDAD_ECONOMICAService(ICOM_ACTIVIDAD_ECONOMICARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_ACTIVIDAD_ECONOMICAParam xWhere)
		{
			var p = new List<CParameter>
			{
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_ACTIVIDAD_ECONOMICAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_ACTIVIDAD_ECONOMICA",Value=xWhere.CORR_ACTIVIDAD_ECONOMICA,DbType=System.Data.DbType.String},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_ACTIVIDAD_ECONOMICATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
