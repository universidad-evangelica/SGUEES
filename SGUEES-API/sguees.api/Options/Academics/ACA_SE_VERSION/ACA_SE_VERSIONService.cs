// Qué hace: servicio del catálogo versiones socioeconómico.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_SE_VERSIONService : IACA_SE_VERSIONService
	{
		private readonly IACA_SE_VERSIONRepository _repo;

		public ACA_SE_VERSIONService(IACA_SE_VERSIONRepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_SE_VERSIONParam xWhere)
		{
			return await _repo.GetAllAsync(new List<CParameter>());
		}

		public async Task<CResult> GetAsync(ACA_SE_VERSIONParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION", Value = xWhere.CORR_VERSION, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(ACA_SE_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(ACA_SE_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(ACA_SE_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(ACA_SE_VERSIONTable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);

		// Qué hace: lookup de versiones activas para GetLookUp.
		public Task<CResult> GetVersionesActivasAsync()
			=> _repo.GetVersionesActivasAsync();
	}
}
