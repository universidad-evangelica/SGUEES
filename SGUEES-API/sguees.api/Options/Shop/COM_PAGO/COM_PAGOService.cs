using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using eadmindevprojectmanagement.Models;
using eadmindevprojectmanagement.Repositories;

namespace eadmindevprojectmanagement.Services
{
	public class COM_PAGOService : ICOM_PAGOService
	{
		private readonly ICOM_PAGORepository _repo;

		public COM_PAGOService(ICOM_PAGORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(COM_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date },
				new() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date },
				new() { ParameterName = "OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllDataAsync(p);
		}

		public async Task<CResult> GetAsync(COM_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = xWhere.CORR_PAGO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> BorrarDetalleAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.BorrarDetalleAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> AplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.AplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> DesAplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> await _repo.DesAplicarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetAllDesAplicarAsync(COM_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "FECHA_INICIAL", Value = xWhere.FECHA_INICIAL, DbType = System.Data.DbType.Date },
				new() { ParameterName = "FECHA_FINAL", Value = xWhere.FECHA_FINAL, DbType = System.Data.DbType.Date },
				new() { ParameterName = "OPCION_CONSULTA", Value = 2, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllDesAplicarAsync(p);
		}

		public Task<CResult> AnularAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.AnularAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActualizarCuentaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActualizarCuentaAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> AsignarArchivoAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.AsignarArchivoAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public async Task<CResult> GetAllDocAsync(COM_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = xWhere.CORR_PAGO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllDocAsync(p);
		}

		public async Task<CResult> GetBeneficiarioAsync(COM_PAGOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 4, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "ANIO_PERIODO", Value = xWhere.ANIO_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "MES_PERIODO", Value = xWhere.MES_PERIODO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PAGO", Value = xWhere.CORR_PAGO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = 2, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetBeneficiarioAsync(p);
		}

		public Task<CResult> GenerarContaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.GenerarContaAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
