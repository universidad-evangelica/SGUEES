using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_SOLI_COTIZACION_DETAService: ICOM_SOLI_COTIZACION_DETAService
	{
		private readonly ICOM_SOLI_COTIZACION_DETARepository _repo;
		
		public COM_SOLI_COTIZACION_DETAService(ICOM_SOLI_COTIZACION_DETARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_SOLI_COTIZACION_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=xWhere.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_SOLI_COTIZACION_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SOLI_COTIZACION",Value=xWhere.CORR_SOLI_COTIZACION,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SOLI_COTIZACION_DETA",Value=xWhere.CORR_SOLI_COTIZACION_DETA,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_SOLI_COTIZACION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
