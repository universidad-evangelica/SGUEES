// Qué hace: capa de servicio del catálogo religión.
// Cómo lo hace: arma parámetros CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_RELIGIONService : IGEN_RELIGIONService
	{
		private readonly IGEN_RELIGIONRepository _repo;

		public GEN_RELIGIONService(IGEN_RELIGIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_RELIGIONParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_RELIGIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_RELIGION", Value = xWhere.CORR_RELIGION, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_RELIGIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
