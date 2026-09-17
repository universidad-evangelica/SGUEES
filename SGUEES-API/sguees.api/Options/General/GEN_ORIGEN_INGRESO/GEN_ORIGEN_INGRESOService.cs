// Qué hace: capa de servicio del catálogo origen ingreso.
// Cómo lo hace: arma parámetros CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_ORIGEN_INGRESOService : IGEN_ORIGEN_INGRESOService
	{
		private readonly IGEN_ORIGEN_INGRESORepository _repo;

		public GEN_ORIGEN_INGRESOService(IGEN_ORIGEN_INGRESORepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_ORIGEN_INGRESOParam xWhere)
		{
			var p = new List<CParameter>();
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(GEN_ORIGEN_INGRESOParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_ORIGEN_INGRESO", Value = xWhere.CORR_ORIGEN_INGRESO, DbType = System.Data.DbType.Int32 },
			};

			return await _repo.GetAsync(p);
		}

		public async Task<CResult> CreateAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> UpdateAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> DeleteAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}

		public async Task<CResult> ActivarInactivarAsync(GEN_ORIGEN_INGRESOTable Data, string vLOGIN_SISTEMA, string vESTACION)
		{
			return await _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
		}
	}
}
