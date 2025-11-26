using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;
using scuees.Repositories;

namespace scuees.Services
{
	public class COM_COTIZACION_COMENTARIOService: ICOM_COTIZACION_COMENTARIOService
	{
		private readonly ICOM_COTIZACION_COMENTARIORepository _repo;
		
		public COM_COTIZACION_COMENTARIOService(ICOM_COTIZACION_COMENTARIORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(COM_COTIZACION_COMENTARIOParam xWhere, Int32 TIPO_USUARIO)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION",Value=xWhere.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
			};

			if (TIPO_USUARIO == 6) 
			{
				p.Add(new() {ParameterName="CLASE_COMENTARIO",Value="EX",DbType=System.Data.DbType.String});
			}
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(COM_COTIZACION_COMENTARIOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new() {ParameterName="ANIO_PERIODO",Value=xWhere.ANIO_PERIODO,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COTIZACION",Value=xWhere.CORR_COTIZACION,DbType=System.Data.DbType.Int32},
				new() {ParameterName="CORR_COMENTARIO",Value=xWhere.CORR_COMENTARIO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(COM_COTIZACION_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(COM_COTIZACION_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(COM_COTIZACION_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
