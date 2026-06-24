using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_CLASE_PARTIDAService : ICON_CLASE_PARTIDAService
	{
		private readonly ICON_CLASE_PARTIDARepository _repo;
		public CON_CLASE_PARTIDAService(ICON_CLASE_PARTIDARepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_CLASE_PARTIDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_CLASE_PARTIDAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_CLASE_PARTIDATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
