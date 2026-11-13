using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Repositories;

namespace eadmindevprojectmanagement.Services
{
	public class COM_PROVISIONService : ICOM_PROVISIONService
	{
		private readonly ICOM_PROVISIONRepository _repo;

		public COM_PROVISIONService(ICOM_PROVISIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(COM_PROVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.DateTime },
				new CParameter() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.DateTime },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_PROVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PROVISION", Value = xWhere.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> AplicarAsync(COM_PROVISIONTable Data)
		{
			return await _repo.AplicarAsync(Data);
		}

		public async Task<CResult> AnularAsync(COM_PROVISIONTable Data)
		{
			return await _repo.AnularAsync(Data);
		}

		public async Task<CResult> DesAplicarAsync(COM_PROVISIONTable Data)
		{
			return await _repo.DesAplicarAsync(Data);
		}

		public async Task<CResult> BorrarDetalleAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.BorrarDetalleAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GenerarContaAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.GenerarContaAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> GetAllDesAplicarAsync(COM_PROVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date },
				new CParameter() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date },
			};
			return await _repo.GetAllDesAplicarAsync(p);
		}
	}
}
