using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class CON_PARAMETROService : ICON_PARAMETROService
	{
		private readonly ICON_PARAMETRORepository _repo;

		public CON_PARAMETROService(ICON_PARAMETRORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(CON_PARAMETROParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(CON_PARAMETROParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() {ParameterName="CORR_EMPRESA",Value=xWhere.CORR_EMPRESA,DbType=System.Data.DbType.Int32},
			};
			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
