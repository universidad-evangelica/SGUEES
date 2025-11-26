using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_BITACORAService: ICOM_BITACORAService
	{
		private readonly ICOM_BITACORARepository _repo;
		
		public COM_BITACORAService(ICOM_BITACORARepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="TIPO_CONSULTA",Value=QueryType.AllRowsAllColumns,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="FECHA_INICIAL",Value=xWhere.FECHA_INICIAL,DbType=System.Data.DbType.DateTime},
				new CParameter() {ParameterName="FECHA_FINAL",Value=xWhere.FECHA_FINAL,DbType=System.Data.DbType.DateTime},
				new CParameter() {ParameterName="CODIGO_OPCION",Value=xWhere.CODIGO_OPCION,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="CLASE_BITACORA",Value=xWhere.CLASE_BITACORA,DbType=System.Data.DbType.String},
				new CParameter() {ParameterName="OPCION_CONSULTA",Value=1,DbType=System.Data.DbType.Int32},
				
			};
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_BITACORAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_BITACORA",Value=xWhere.CORR_BITACORA,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
