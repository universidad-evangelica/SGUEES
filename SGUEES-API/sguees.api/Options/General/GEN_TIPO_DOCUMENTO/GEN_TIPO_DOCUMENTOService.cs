using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class GEN_TIPO_DOCUMENTOService: IGEN_TIPO_DOCUMENTOService
	{
		private readonly IGEN_TIPO_DOCUMENTORepository _repo;
		private readonly IGEN_TIPO_DOCUMENTO_RUBRORepository _repoRubro;
		
		public GEN_TIPO_DOCUMENTOService(IGEN_TIPO_DOCUMENTORepository repo, IGEN_TIPO_DOCUMENTO_RUBRORepository repoRubro)
		{
			_repo = repo;
			_repoRubro = repoRubro;
		}
		
		public async Task<CResult> GetAllAsync(GEN_TIPO_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(GEN_TIPO_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_TIPO_DOC",Value=xWhere.CORR_TIPO_DOC,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(GEN_TIPO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(GEN_TIPO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(GEN_TIPO_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var vDataRubro = new GEN_TIPO_DOCUMENTO_RUBROTable();
			vDataRubro.CORR_EMPRESA = Data.CORR_EMPRESA;
			vDataRubro.CORR_TIPO_DOC = Data.CORR_TIPO_DOC;
			var vResultado = await _repoRubro.DeleteAsync(vDataRubro, vLOGIN_SISTEMA, vESTACION);
			
			if (vResultado.Result)
			{
				vResultado = await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
			}
			
			return vResultado;
		}
		public async Task<CResult> GetTipoDocumentosAsync(GEN_TIPO_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="USAR_COMPRAS",Value=xWhere.USAR_COMPRAS,DbType=System.Data.DbType.Int32});
			return await _repo.GetAllLookUpAsync(p);
		}
	}
}
