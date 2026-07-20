using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_CONCILIA_BANCARIA_DETAService : IBAN_CONCILIA_BANCARIA_DETAService
	{
		private readonly IBAN_CONCILIA_BANCARIA_DETARepository _repo;

		public BAN_CONCILIA_BANCARIA_DETAService(IBAN_CONCILIA_BANCARIA_DETARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_CONCILIA_BANCARIA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = xWhere.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_CONCILIA_BANCARIA_DETAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = xWhere.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION_DETA", Value = xWhere.CORR_CONCILIACION_DETA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
