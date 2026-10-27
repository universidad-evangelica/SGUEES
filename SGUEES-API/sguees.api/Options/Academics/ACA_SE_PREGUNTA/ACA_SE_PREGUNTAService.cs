// Qué hace: servicio del catálogo preguntas socioeconómico.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_SE_PREGUNTAService : IACA_SE_PREGUNTAService
	{
		private readonly IACA_SE_PREGUNTARepository _repo;

		public ACA_SE_PREGUNTAService(IACA_SE_PREGUNTARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_SE_PREGUNTAParam xWhere)
		{
			return await _repo.GetAllAsync(new List<CParameter>());
		}

		public async Task<CResult> GetAsync(ACA_SE_PREGUNTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_PREGUNTA", Value = xWhere.CORR_PREGUNTA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(ACA_SE_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(ACA_SE_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(ACA_SE_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(ACA_SE_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
