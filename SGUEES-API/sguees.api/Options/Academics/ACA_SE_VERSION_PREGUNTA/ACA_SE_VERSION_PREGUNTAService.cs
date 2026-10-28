// Qué hace: servicio de preguntas por versión socioeconómico.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class ACA_SE_VERSION_PREGUNTAService : IACA_SE_VERSION_PREGUNTAService
	{
		private readonly IACA_SE_VERSION_PREGUNTARepository _repo;

		public ACA_SE_VERSION_PREGUNTAService(IACA_SE_VERSION_PREGUNTARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(ACA_SE_VERSION_PREGUNTAParam xWhere)
		{
			var p = new List<CParameter>();
			if (xWhere?.CORR_VERSION > 0)
			{
				p.Add(new CParameter() { ParameterName = "CORR_VERSION", Value = xWhere.CORR_VERSION, DbType = System.Data.DbType.Int32 });
			}
			return await _repo.GetAllAsync(p);
		}

		public async Task<CResult> GetAsync(ACA_SE_VERSION_PREGUNTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_VERSION_PREGUNTA", Value = xWhere.CORR_VERSION_PREGUNTA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(ACA_SE_VERSION_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
