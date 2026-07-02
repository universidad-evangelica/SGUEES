using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class BAN_LINEA_TRABAJO_CONCILIACIONService : IBAN_LINEA_TRABAJO_CONCILIACIONService
	{
		private readonly IBAN_LINEA_TRABAJO_CONCILIACIONRepository _repo;
		public BAN_LINEA_TRABAJO_CONCILIACIONService(IBAN_LINEA_TRABAJO_CONCILIACIONRepository repo) { _repo = repo; }

		public async Task<CResult> GetAllAsync(BAN_LINEA_TRABAJO_CONCILIACIONParam xWhere)
		{
			var p = new List<CParameter> { new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 } };
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(BAN_LINEA_TRABAJO_CONCILIACIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_LINEA", Value = xWhere.CORR_LINEA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
