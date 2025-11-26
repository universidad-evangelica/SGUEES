using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class GEN_RUBROService: IGEN_RUBROService
	{
		private readonly IGEN_RUBRORepository _repo;
		private readonly IGEN_RUBRO_IMPUESTORepository _repoImpuesto;
		private readonly IGEN_RUBRO_SUMARepository _repoSuma;
		
		public GEN_RUBROService(IGEN_RUBRORepository repo, IGEN_RUBRO_IMPUESTORepository repoImpuesto, IGEN_RUBRO_SUMARepository repoSuma)
		{
			_repo = repo;
			_repoImpuesto = repoImpuesto;
			_repoSuma = repoSuma;
		}
		
		public async Task<CResult> GetAllAsync(GEN_RUBROParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_RUBROParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=xWhere.CORR_RUBRO,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vDataImpuesto = new GEN_RUBRO_IMPUESTOTable();
			vDataImpuesto.CORR_EMPRESA = Data.CORR_EMPRESA;
			vDataImpuesto.CORR_RUBRO = Data.CORR_RUBRO;
			var vResultado=await _repoImpuesto.DeleteAsync(vDataImpuesto, vLOGIN_SISTEMA, vESTACION);
			if (vResultado.Result)
			{
				var vDataSuma = new GEN_RUBRO_SUMATable();
				vDataSuma.CORR_EMPRESA = Data.CORR_EMPRESA;
				vDataSuma.CORR_RUBRO = Data.CORR_RUBRO;

				vResultado=await _repoSuma.DeleteAsync(vDataSuma, vLOGIN_SISTEMA, vESTACION);
				if (vResultado.Result)
				{
					vResultado = await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
				}
			}
			return vResultado;
		}
		public async Task<CResult> GetLookUpAsync(GEN_RUBROParam xWhere)
		{
			var p = new List<CParameter>
            {
				new() { ParameterName = "TIPO_CONSULTA", Value = QueryType.AllRowsComboBox, DbType = System.Data.DbType.Int32 },
                new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
                new() { ParameterName = "OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 }
            };
			
			return await _repo.GetLookUpAsync(p);
		}
	}
}
