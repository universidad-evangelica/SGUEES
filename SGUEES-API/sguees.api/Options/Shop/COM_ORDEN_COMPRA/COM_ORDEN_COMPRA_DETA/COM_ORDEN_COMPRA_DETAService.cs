using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_ORDEN_COMPRA_DETAService: ICOM_ORDEN_COMPRA_DETAService
	{
		private readonly ICOM_ORDEN_COMPRA_DETARepository _repo;
		
		public COM_ORDEN_COMPRA_DETAService(ICOM_ORDEN_COMPRA_DETARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_ORDEN_COMPRA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="NUMERO_ORDEN_COMPRA",Value=xWhere.NUMERO_ORDEN_COMPRA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_ORDEN_COMPRA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="NUMERO_ORDEN_COMPRA",Value=xWhere.NUMERO_ORDEN_COMPRA,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
	}
}
