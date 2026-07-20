using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_CONCILIA_BANCARIAService : IBAN_CONCILIA_BANCARIAService
	{
		private readonly IBAN_CONCILIA_BANCARIARepository _repo;

		public BAN_CONCILIA_BANCARIAService(IBAN_CONCILIA_BANCARIARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_CONCILIA_BANCARIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = xWhere.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.DateTime },
				new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_CONCILIA_BANCARIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = xWhere.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetPendientesAsync(BAN_CONCILIA_BANCARIAParam xWhere)
		{
			var p = BuildConciliacionParams(xWhere);
			return await _repo.GetPendientesAsync(p);
		}

		public async Task<CResult> GetResumenAsync(BAN_CONCILIA_BANCARIAParam xWhere)
		{
			var p = BuildConciliacionParams(xWhere);
			p.Add(new CParameter { ParameterName = "AUMENTA_DISMINUYE", Value = xWhere.AUMENTA_DISMINUYE ?? 1, DbType = System.Data.DbType.Int16 });
			return await _repo.GetResumenAsync(p);
		}

		public async Task<CResult> GetMoviAsync(BAN_CONCILIA_BANCARIAParam xWhere)
		{
			var p = BuildConciliacionParams(xWhere);
			return await _repo.GetMoviAsync(p);
		}

		public async Task<CResult> AplicarAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			var reconstruir = await _repo.ReconstruirMovimientosAsync(Data, vLOGIN_SISTEMA, vESTACION);
			if (!reconstruir.Result)
			{
				return reconstruir;
			}

			return await _repo.AplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DesAplicarAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DesAplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GenerarConciliacionAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.GenerarConciliacionAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ReconstruirMovimientosAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ReconstruirMovimientosAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ForzarConciliacionAsync(BAN_CONCILIA_FORZADAParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ForzarConciliacionAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> RevertirConciliacionAsync(BAN_CONCILIA_REVERTIRParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.RevertirConciliacionAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> MarcarConciliadoAsync(BAN_CONCILIA_FORZADAParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.MarcarConciliadoAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> ImportarExcelAsync(BAN_CONCILIA_BANCARIA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.ImportarExcelAsync(Data, vLOGIN_SISTEMA, vESTACION);

		private static List<CParameter> BuildConciliacionParams(BAN_CONCILIA_BANCARIAParam xWhere)
		{
			return new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CONCILIACION", Value = xWhere.CORR_CONCILIACION, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = 0, DbType = System.Data.DbType.Int32 },
			};
		}
	}
}
