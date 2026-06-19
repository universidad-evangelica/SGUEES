using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_CATALOGO_CUENTAService : ICON_CATALOGO_CUENTAService
	{
		private readonly ICON_CATALOGO_CUENTARepository _repo;
		public CON_CATALOGO_CUENTAService(ICON_CATALOGO_CUENTARepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(CON_CATALOGO_CUENTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CUENTA_CONTABLE",Value=xWhere.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="CODIGO_RUBRO",Value=xWhere.CODIGO_RUBRO,DbType=System.Data.DbType.String},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_CATALOGO_CUENTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CUENTA_CONTABLE",Value=xWhere.CUENTA_CONTABLE,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="CODIGO_RUBRO",Value=xWhere.CODIGO_RUBRO,DbType=System.Data.DbType.String},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> ImportarExcelAsync(CON_CATALOGO_CUENTA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.ImportarExcelAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
