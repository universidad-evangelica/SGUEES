using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_DOCUMENTOService : IBAN_DOCUMENTOService
	{
		private readonly IBAN_DOCUMENTORepository _repo;

		public BAN_DOCUMENTOService(IBAN_DOCUMENTORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "MUESTRA_CHEQUES", Value = xWhere.MUESTRA_CHEQUES.HasValue ? xWhere.MUESTRA_CHEQUES.Value : null, DbType = System.Data.DbType.Boolean },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_DOCUMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_TIPO_MOVIMIENTO", Value = xWhere.CORR_TIPO_MOVIMIENTO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_DOCUMENTO", Value = xWhere.CORR_DOCUMENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> AplicarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.AplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> AnularAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.AnularAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ImprimirChequeAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ImprimirChequeAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
