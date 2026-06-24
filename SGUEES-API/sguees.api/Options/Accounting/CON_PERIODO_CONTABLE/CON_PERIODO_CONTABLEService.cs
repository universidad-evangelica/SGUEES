using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_PERIODO_CONTABLEService : ICON_PERIODO_CONTABLEService
	{
		private readonly ICON_PERIODO_CONTABLERepository _repo;
		public CON_PERIODO_CONTABLEService(ICON_PERIODO_CONTABLERepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_PERIODO_CONTABLEParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_PERIODO_CONTABLEParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> GenerarCierreAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.GenerarCierreAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> GenerarAperturaAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.GenerarAperturaAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
