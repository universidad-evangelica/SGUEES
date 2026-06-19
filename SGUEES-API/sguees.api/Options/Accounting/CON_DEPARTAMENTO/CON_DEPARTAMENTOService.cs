using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Repositories;
using sguees.Models;

namespace sguees.Services
{
	public class CON_DEPARTAMENTOService : ICON_DEPARTAMENTOService
	{
		private readonly ICON_DEPARTAMENTORepository _repository;

		public CON_DEPARTAMENTOService(ICON_DEPARTAMENTORepository repository)
		{
			_repository = repository;
		}

		public async Task<CResult> GetAllAsync(CON_DEPARTAMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPARTAMENTO", Value = xWhere.CORR_DEPARTAMENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_DEPARTAMENTOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DEPARTAMENTO", Value = xWhere.CORR_DEPARTAMENTO, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_DEPARTAMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
