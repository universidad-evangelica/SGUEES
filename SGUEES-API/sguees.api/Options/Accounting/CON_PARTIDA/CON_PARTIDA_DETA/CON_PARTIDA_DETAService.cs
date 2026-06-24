using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_PARTIDA_DETAService : ICON_PARTIDA_DETAService
	{
		private readonly ICON_PARTIDA_DETARepository _repo;
		public CON_PARTIDA_DETAService(ICON_PARTIDA_DETARepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_PARTIDA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA_DETA",Value=xWhere.CORR_PARTIDA_DETA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_PARTIDA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CLASE_PARTIDA",Value=xWhere.CORR_CLASE_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA",Value=xWhere.CORR_PARTIDA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_PARTIDA_DETA",Value=xWhere.CORR_PARTIDA_DETA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
