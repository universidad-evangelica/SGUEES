using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Repositories;
using sguees.Models;

namespace sguees.Services
{
	public class CON_DIVISIONService : ICON_DIVISIONService
	{
		private readonly ICON_DIVISIONRepository _repository;

		public CON_DIVISIONService(ICON_DIVISIONRepository repository)
		{
			_repository = repository;
		}

		public async Task<CResult> GetAllAsync(CON_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DIVISION", Value = xWhere.CORR_DIVISION, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_DIVISIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_DIVISION", Value = xWhere.CORR_DIVISION, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_DIVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
