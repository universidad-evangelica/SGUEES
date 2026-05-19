using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_MUNICIPIOService: IGEN_MUNICIPIOService
	{
		private readonly IGEN_MUNICIPIORepository _repo;
		
		public GEN_MUNICIPIOService(IGEN_MUNICIPIORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(GEN_MUNICIPIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_PAIS",Value=xWhere.CORR_PAIS,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_DEPTO",Value=xWhere.CORR_DEPTO,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_MUNICIPIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_PAIS",Value=xWhere.CORR_PAIS,DbType=System.Data.DbType.Int32},
				//new CParameter() {ParameterName="CORR_DEPTO",Value=xWhere.CORR_DEPTO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_MUNICIPIO",Value=xWhere.CORR_MUNICIPIO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_MUNICIPIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_MUNICIPIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_MUNICIPIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
