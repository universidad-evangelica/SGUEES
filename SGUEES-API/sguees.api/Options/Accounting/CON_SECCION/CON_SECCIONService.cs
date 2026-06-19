using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Repositories;
using sguees.Models;

namespace sguees.Services
{
	public class CON_SECCIONService : ICON_SECCIONService
	{
		private readonly ICON_SECCIONRepository _repository;

		public CON_SECCIONService(ICON_SECCIONRepository repository)
		{
			_repository = repository;
		}

		public async Task<CResult> GetAllAsync(CON_SECCIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SECCION", Value = xWhere.CORR_SECCION, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_SECCIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_EMPRESA", Value = xWhere.CORR_EMPRESA, DbType = System.Data.DbType.Int32 },
				new CParameter() { ParameterName = "CORR_SECCION", Value = xWhere.CORR_SECCION, DbType = System.Data.DbType.Int32 },
			};
			return await _repository.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> UpdateAsync(CON_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		public async Task<CResult> DeleteAsync(CON_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION) => await _repository.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
