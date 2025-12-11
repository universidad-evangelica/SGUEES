using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_DOCUMENTO_DETA_DOCService: ICOM_DOCUMENTO_DETA_DOCService
	{
		private readonly ICOM_DOCUMENTO_DETA_DOCRepository _repo;
		
		public COM_DOCUMENTO_DETA_DOCService(ICOM_DOCUMENTO_DETA_DOCRepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_DOCUMENTO_DETA_DOCParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_DOCUMENTO_DETA_DOCParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="ANIO_PERIODO_DOC",Value=xWhere.ANIO_PERIODO_DOC,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="MES_PERIODO_DOC",Value=xWhere.MES_PERIODO_DOC,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO_DOC",Value=xWhere.CORR_DOCUMENTO_DOC,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_DOCUMENTO_DETA_DOCTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
