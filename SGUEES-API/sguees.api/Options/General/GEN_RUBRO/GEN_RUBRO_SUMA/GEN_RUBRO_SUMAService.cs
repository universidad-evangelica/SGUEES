using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class GEN_RUBRO_SUMAService: IGEN_RUBRO_SUMAService
	{
		private readonly IGEN_RUBRO_SUMARepository _repo;
		
		public GEN_RUBRO_SUMAService(IGEN_RUBRO_SUMARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_RUBRO_SUMAParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=xWhere.CORR_RUBRO,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_RUBRO_SUMAParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=xWhere.CORR_RUBRO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_SUMA",Value=xWhere.CORR_SUMA,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_RUBRO_SUMATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
