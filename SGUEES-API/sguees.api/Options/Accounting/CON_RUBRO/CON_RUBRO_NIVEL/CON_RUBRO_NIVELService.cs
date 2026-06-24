using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_RUBRO_NIVELService : ICON_RUBRO_NIVELService
	{
		private readonly ICON_RUBRO_NIVELRepository _repo;
		public CON_RUBRO_NIVELService(ICON_RUBRO_NIVELRepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_RUBRO_NIVELParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CODIGO_RUBRO",Value=xWhere.CODIGO_RUBRO,DbType=System.Data.DbType.String},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_RUBRO_NIVELParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CODIGO_RUBRO",Value=xWhere.CODIGO_RUBRO,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="NIVEL",Value=xWhere.NIVEL,DbType=System.Data.DbType.Int16},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_RUBRO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_RUBRO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_RUBRO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
