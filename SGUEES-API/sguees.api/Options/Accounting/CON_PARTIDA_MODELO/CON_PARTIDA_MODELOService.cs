using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_PARTIDA_MODELOService : ICON_PARTIDA_MODELOService
	{
		private readonly ICON_PARTIDA_MODELORepository _repo;
		public CON_PARTIDA_MODELOService(ICON_PARTIDA_MODELORepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_PARTIDA_MODELOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_PARTIDA_MODELOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
