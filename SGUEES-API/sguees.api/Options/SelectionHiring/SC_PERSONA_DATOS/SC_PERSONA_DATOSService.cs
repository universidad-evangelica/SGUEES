using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class SC_PERSONA_DATOSService : ISC_PERSONA_DATOSService
	{
		private readonly ISC_PERSONA_DATOSRepository _repo;

		public SC_PERSONA_DATOSService(ISC_PERSONA_DATOSRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(SC_PERSONA_DATOSParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(SC_PERSONA_DATOSParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_PERSONA_DATOS", Value = xWhere.CORR_PERSONA_DATOS, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(SC_PERSONA_DATOSTable Data, string vUSERNAME_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vUSERNAME_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(SC_PERSONA_DATOSTable Data, string vUSERNAME_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vUSERNAME_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(SC_PERSONA_DATOSTable Data, string vUSERNAME_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vUSERNAME_SISTEMA, vESTACION);
		}
	}
}
