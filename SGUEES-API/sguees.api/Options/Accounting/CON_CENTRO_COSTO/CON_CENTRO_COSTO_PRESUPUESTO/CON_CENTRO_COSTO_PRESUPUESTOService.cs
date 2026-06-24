using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_CENTRO_COSTO_PRESUPUESTOService : ICON_CENTRO_COSTO_PRESUPUESTOService
	{
		private readonly ICON_CENTRO_COSTO_PRESUPUESTORepository _repo;
		public CON_CENTRO_COSTO_PRESUPUESTOService(ICON_CENTRO_COSTO_PRESUPUESTORepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_CENTRO_COSTO_PRESUPUESTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=xWhere.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_CENTRO_COSTO_PRESUPUESTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CENTRO_COSTO",Value=xWhere.CORR_CENTRO_COSTO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_CENTRO_COSTO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_CENTRO_COSTO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_CENTRO_COSTO_PRESUPUESTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
