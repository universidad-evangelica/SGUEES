// Qué hace: servicio del catálogo tipos de pregunta SE.
// Cómo lo hace: arma CParameter y delega al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_SE_TIPO_PREGUNTAService : IGEN_SE_TIPO_PREGUNTAService
	{
		private readonly IGEN_SE_TIPO_PREGUNTARepository _repo;

		public GEN_SE_TIPO_PREGUNTAService(IGEN_SE_TIPO_PREGUNTARepository repo)
		{
			_repo = repo;
		}

		public async Task<CResult> GetAllAsync(GEN_SE_TIPO_PREGUNTAParam xWhere)
		{
			return await _repo.GetAllAsync(new List<CParameter>());
		}

		public async Task<CResult> GetAsync(GEN_SE_TIPO_PREGUNTAParam xWhere)
		{
			var p = new List<CParameter>
			{
				new CParameter() { ParameterName = "CORR_TIPO_PREGUNTA", Value = xWhere.CORR_TIPO_PREGUNTA, DbType = System.Data.DbType.Int32 },
			};
			return await _repo.GetAsync(p);
		}

		public Task<CResult> CreateAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.CreateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> UpdateAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.UpdateAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> DeleteAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.DeleteAsync(Data, vLOGIN_SISTEMA, vESTACION);

		public Task<CResult> ActivarInactivarAsync(GEN_SE_TIPO_PREGUNTATable Data, string vLOGIN_SISTEMA, string vESTACION)
			=> _repo.ActivarInactivarAsync(Data, vLOGIN_SISTEMA, vESTACION);
	}
}
