using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_ORDEN_COMPRA_DETAService : ICOM_ORDEN_COMPRA_DETAService
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
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_ORDEN_COMPRA", Value = xWhere.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_ORDEN_COMPRA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_ORDEN_COMPRA", Value = xWhere.CORR_ORDEN_COMPRA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_ORDEN_COMPRA_DETA", Value = xWhere.CORR_ORDEN_COMPRA_DETA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> DeleteAsync(COM_ORDEN_COMPRA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
