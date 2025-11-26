using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Repositories;

namespace eadmindevprojectmanagement.Services
{
	public class COM_DOCUMENTO_TOTALService: ICOM_DOCUMENTO_TOTALService
	{
		private readonly ICOM_DOCUMENTO_TOTALRepository _repo;
		
		public COM_DOCUMENTO_TOTALService(ICOM_DOCUMENTO_TOTALRepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_DOCUMENTO_TOTALParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_DOCUMENTO_TOTALParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_RUBRO",Value=xWhere.CORR_RUBRO,DbType=System.Data.DbType.Int32});
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_DOCUMENTO_TOTALTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		public async Task<CResult> GetAllRubrosTemporalesAsync(COM_DOCUMENTO_TOTALParam xWhere)
		{
			var p = new List<CParameter>();
			p.Add(new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="MES_PERIODO",Value=xWhere.MES_PERIODO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_DOCUMENTO",Value=xWhere.CORR_DOCUMENTO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_TIPO_GASTO",Value=xWhere.CORR_TIPO_GASTO,DbType=System.Data.DbType.Int32});
			p.Add(new CParameter() {ParameterName="CORR_TIPO_DOC",Value=xWhere.CORR_TIPO_DOC,DbType=System.Data.DbType.Int32});
			
			return await _repo.GetAllRubrosTemporalesAsync(p);
		}
	}
}
