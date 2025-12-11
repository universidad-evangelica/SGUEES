using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESService: ICOM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESService
	{
		private readonly ICOM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESRepository _repo;
		
		public COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESService(ICOM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESRepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CONFIGURACION",Value=xWhere.CORR_CONFIGURACION,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
