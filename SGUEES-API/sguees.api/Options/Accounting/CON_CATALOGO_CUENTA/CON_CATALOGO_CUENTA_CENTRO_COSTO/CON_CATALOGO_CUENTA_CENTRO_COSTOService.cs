using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_CATALOGO_CUENTA_CENTRO_COSTOService : ICON_CATALOGO_CUENTA_CENTRO_COSTOService
	{
		private readonly ICON_CATALOGO_CUENTA_CENTRO_COSTORepository _repo;
		public CON_CATALOGO_CUENTA_CENTRO_COSTOService(ICON_CATALOGO_CUENTA_CENTRO_COSTORepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CUENTA_CONTABLE",Value=xWhere.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CUENTA_CONTABLE",Value=xWhere.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
