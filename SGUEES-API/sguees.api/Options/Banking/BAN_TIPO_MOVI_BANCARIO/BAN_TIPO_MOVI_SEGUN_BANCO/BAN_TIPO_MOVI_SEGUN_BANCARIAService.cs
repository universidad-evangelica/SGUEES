using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_TIPO_MOVI_SEGUN_BANCARIAService : IBAN_TIPO_MOVI_SEGUN_BANCARIAService
	{
		private readonly IBAN_TIPO_MOVI_SEGUN_BANCORepository _repo;

		public BAN_TIPO_MOVI_SEGUN_BANCARIAService(IBAN_TIPO_MOVI_SEGUN_BANCORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_TIPO_MOVI_SEGUN_BANCOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_TIPO_MOVI_SEGUN_BANCOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_BANCO", Value = xWhere.CORR_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CODIGO_MOVIMIENTO", Value = xWhere.CODIGO_MOVIMIENTO, DbType = System.Data.DbType.String },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_TIPO_MOVI_SEGUN_BANCARIOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
