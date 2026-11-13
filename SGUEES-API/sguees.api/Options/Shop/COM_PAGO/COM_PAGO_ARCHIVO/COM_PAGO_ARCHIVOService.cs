using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class COM_PAGO_ARCHIVOService : ICOM_PAGO_ARCHIVOService
	{
		private readonly ICOM_PAGO_ARCHIVORepository _repo;

		public COM_PAGO_ARCHIVOService(ICOM_PAGO_ARCHIVORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(COM_PAGO_ARCHIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = xWhere.TIPO_CONSULTA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = xWhere.OPCION_CONSULTA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAllAPagarAsync(COM_PAGO_ARCHIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "TIPO_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_CUENTA_BANCO", Value = xWhere.CORR_CUENTA_BANCO, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "OPCION_CONSULTA", Value = 1, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAPagarAsync(p);
		}

		public async Task<CResult> GetAsync(COM_PAGO_ARCHIVOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_ARCHIVO", Value = xWhere.CORR_ARCHIVO, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> GenerarMoviBancarioArchivoAsync(COM_PAGO_ARCHIVOTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.GenerarMoviBancarioArchivoAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
