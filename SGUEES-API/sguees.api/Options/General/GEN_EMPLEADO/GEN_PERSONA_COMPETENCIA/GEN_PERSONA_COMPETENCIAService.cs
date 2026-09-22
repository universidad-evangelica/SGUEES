// Qué hace: servicio de competencias anidadas en GEN_EMPLEADO.
// Cómo lo hace: delega GetAll/SaveAll al repositorio.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_PERSONA_COMPETENCIAService : IGEN_PERSONA_COMPETENCIAService
	{
		private readonly IGEN_PERSONA_COMPETENCIARepository _repo;

		public GEN_PERSONA_COMPETENCIAService(IGEN_PERSONA_COMPETENCIARepository repo)
		{
			_repo = repo;
		}

		public Task<CResult> GetAllAsync(GEN_PERSONA_COMPETENCIAParam xWhere, int corrEmpresa)
			=> _repo.GetAllAsync(xWhere?.CORR_PERSONA ?? 0, corrEmpresa);

		public Task<CResult> SaveAllAsync(
			long corrPersona,
			List<GEN_PERSONA_COMPETENCIATable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
			=> _repo.SaveAllAsync(corrPersona, Data, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
	}
}
