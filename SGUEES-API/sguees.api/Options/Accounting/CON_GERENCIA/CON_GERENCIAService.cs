using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Repositories;
using sguees.Models;

namespace sguees.Services
{
	public class CON_GERENCIAService : ICON_GERENCIAService
	{
		private readonly ICON_GERENCIARepository _repository;

		public CON_GERENCIAService(ICON_GERENCIARepository repository)
		{
			_repository = repository;
		}

		public async Task<CResult> GetAllAsync(CON_GERENCIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_GERENCIA", Value = xWhere.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_GERENCIAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_GERENCIA", Value = xWhere.CORR_GERENCIA, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_GERENCIATable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
