using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_CUADRO_COMPARATIVO_COMENTARIOService: ICOM_CUADRO_COMPARATIVO_COMENTARIOService
	{
		private readonly ICOM_CUADRO_COMPARATIVO_COMENTARIORepository _repo;
		
		public COM_CUADRO_COMPARATIVO_COMENTARIOService(ICOM_CUADRO_COMPARATIVO_COMENTARIORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_COMENTARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
			};

			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_COMENTARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_CUADRO_COMPARATIVO",Value=xWhere.CORR_CUADRO_COMPARATIVO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COMENTARIO",Value=xWhere.CORR_COMENTARIO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
