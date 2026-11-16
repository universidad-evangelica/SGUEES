using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_PAGO_CONTAService : ICOM_PAGO_CONTAService
	{
		private readonly ICOM_PAGO_CONTARepository _repo;

		public COM_PAGO_CONTAService(ICOM_PAGO_CONTARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(COM_PAGO_CONTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = xWhere.TIPO_CONSULTA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = xWhere.CORR_PAGO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(COM_PAGO_CONTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = xWhere.CORR_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DETA", Value = xWhere.CORR_DETA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(COM_PAGO_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(COM_PAGO_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(COM_PAGO_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
