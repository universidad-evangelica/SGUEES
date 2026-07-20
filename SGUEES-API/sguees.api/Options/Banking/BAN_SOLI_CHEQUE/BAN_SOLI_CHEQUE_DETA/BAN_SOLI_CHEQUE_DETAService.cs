using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_SOLI_CHEQUE_DETAService : IBAN_SOLI_CHEQUE_DETAService
	{
		private readonly IBAN_SOLI_CHEQUE_DETARepository _repo;

		public BAN_SOLI_CHEQUE_DETAService(IBAN_SOLI_CHEQUE_DETARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_SOLI_CHEQUE_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO_DETA", Value = xWhere.CORR_DOCUMENTO_DETA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_SOLI_CHEQUE_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO_DETA", Value = xWhere.CORR_DOCUMENTO_DETA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
