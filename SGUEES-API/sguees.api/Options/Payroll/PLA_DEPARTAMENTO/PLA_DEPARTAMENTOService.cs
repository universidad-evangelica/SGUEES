using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class PLA_DEPARTAMENTOService: IPLA_DEPARTAMENTOService
	{
		private readonly IPLA_DEPARTAMENTORepository _repo;
		
		public PLA_DEPARTAMENTOService(IPLA_DEPARTAMENTORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(PLA_DEPARTAMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(PLA_DEPARTAMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_DEPARTAMENTO",Value=xWhere.CORR_DEPARTAMENTO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(PLA_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(PLA_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(PLA_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
