using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;
using SGUEES.Models;

namespace sguees.Services
{
	public class SC_SOLICITUD_EMPLEOService: ISC_SOLICITUD_EMPLEOService
	{
		private readonly ISC_SOLICITUD_EMPLEORepository _repo;
		
		public SC_SOLICITUD_EMPLEOService(ISC_SOLICITUD_EMPLEORepository repo)
		{
			_repo = repo;
		}
		
		public async Task<CResult> GetAllAsync(SC_SOLICITUD_EMPLEOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			
			return await _repo.GetAllAsync(p);
		}
		
		public async Task<CResult> GetAsync(SC_SOLICITUD_EMPLEOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
				new CParameter() {ParameterName="CORR_SOLICITUD_EMPLEO",Value=xWhere.CORR_SOLICITUD_EMPLEO,DbType=System.Data.DbType.Int32},
			};
		
			return await _repo.GetAsync(p);
		}
		
		public async Task<CResult> CreateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> UpdateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
		
		public async Task<CResult> DeleteAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

        ////Funcion para inactivar un registro, no se borra de la base de datos, solo se cambia el estado a inactivo
        //public async Task<CResult> DesactivateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        //{
        //    return await _repo.DesactivateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        //}

        ////Funcion para reactivar un registro, no se borra de la base de datos, solo se cambia el estado a activo
        //public async Task<CResult> ReactivateAsync(SC_SOLICITUD_EMPLEOTable Data, string vLOGIN_SISTEMA, string vESTACION)
        //{
        //    return await _repo.ReactivateAsync(Data, vLOGIN_SISTEMA, vESTACION);
        //}
    }
}
