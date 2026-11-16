using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_PROVISION_DETAService : ICOM_PROVISION_DETAService
	{
		private readonly ICOM_PROVISION_DETARepository _repo;

		public COM_PROVISION_DETAService(ICOM_PROVISION_DETARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(COM_PROVISION_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PROVISION", Value = xWhere.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_PROVISION_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PROVISION", Value = xWhere.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DETA", Value = xWhere.CORR_DETA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> GetAllDisponiblesAsync(COM_PROVISION_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PROVISION", Value = xWhere.CORR_PROVISION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllDisponiblesAsync(p);
		}

		public async Task<CResult> CreateAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
