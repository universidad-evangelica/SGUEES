using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class GEN_TIPO_GASTO_IMPUESTOService: IGEN_TIPO_GASTO_IMPUESTOService
	{
		private readonly IGEN_TIPO_GASTO_IMPUESTORepository _repo;
		
		public GEN_TIPO_GASTO_IMPUESTOService(IGEN_TIPO_GASTO_IMPUESTORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_TIPO_GASTO_IMPUESTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=xWhere.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_TIPO_GASTO_IMPUESTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=xWhere.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=xWhere.CORR_RUBRO,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_TIPO_GASTO_IMPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
