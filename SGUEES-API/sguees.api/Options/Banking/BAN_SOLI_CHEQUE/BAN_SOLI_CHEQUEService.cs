using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_SOLI_CHEQUEService : IBAN_SOLI_CHEQUEService
	{
		private readonly IBAN_SOLI_CHEQUERepository _repo;

		public BAN_SOLI_CHEQUEService(IBAN_SOLI_CHEQUERepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(BAN_SOLI_CHEQUEParam xWhere)
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
				new() { ParameterName = "ESTADO_DOCUMENTO", Value = string.IsNullOrWhiteSpace(xWhere.ESTADO_DOCUMENTO) ? string.Empty : xWhere.ESTADO_DOCUMENTO.Trim(), DbType = System.Data.DbType.String },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "EXCLUIR_ANULADOS", Value = xWhere.EXCLUIR_ANULADOS == true, DbType = System.Data.DbType.Boolean },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_SOLI_CHEQUEParam xWhere)
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

		public async Task<CResult> CreateAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> UpdateAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DeleteAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> EnviarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.EnviarSolicitudAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> CancelarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.CancelarSolicitudAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> AutorizarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.AutorizarSolicitudAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
