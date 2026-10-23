using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PROVEEDORService : IGEN_PROVEEDORService
	{
		private readonly IGEN_PROVEEDORRepository _repo;

		public GEN_PROVEEDORService(IGEN_PROVEEDORRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_PROVEEDORParam xWhere)
		{
			var p = new List<CParameter>
			{
				new() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new() { ParameterName = "CORR_PROVEEDOR", Value = xWhere.CORR_PROVEEDOR, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> GetPersonasLookupAsync(GEN_PROVEEDORParam xWhere)
			=> _repo.GetPersonasLookupAsync(xWhere.CORR_EMPRESA, xWhere.CORR_PERSONA);

		public async Task<CResult> CreateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			ApplyCreateDefaults(Data);
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public Task<CResult> UpdateAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(GEN_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		private static void ApplyCreateDefaults(GEN_PROVEEDORTable Data)
		{
			Data.CODIGO_PROVEEDOR ??= string.Empty;
			Data.CUENTA_BANCARIA ??= string.Empty;
			Data.ESTADO_PROVEEDOR = string.IsNullOrWhiteSpace(Data.ESTADO_PROVEEDOR) ? "A" : Data.ESTADO_PROVEEDOR;
			Data.ESTADO_PROVEEDOR_WEB = string.IsNullOrWhiteSpace(Data.ESTADO_PROVEEDOR_WEB) ? "D" : Data.ESTADO_PROVEEDOR_WEB;
		}
	}
}
