// Qué hace: servicio de puestos anidados en GEN_EMPLEADO.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public class GEN_EMPLEADO_PUESTOService : IGEN_EMPLEADO_PUESTOService
	{
		private readonly IGEN_EMPLEADO_PUESTORepository _repo;

		public GEN_EMPLEADO_PUESTOService(IGEN_EMPLEADO_PUESTORepository repo)
		{
			_repo = repo;
		}

		public Task<CResult> GetAllAsync(GEN_EMPLEADO_PUESTOParam xWhere, int corrEmpresa)
			=> _repo.GetAllAsync(xWhere?.CORR_EMPLEADO ?? 0, corrEmpresa);

		public Task<CResult> SaveAllAsync(
			int corrEmpleado,
			List<GEN_EMPLEADO_PUESTOTable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
			=> _repo.SaveAllAsync(corrEmpleado, Data, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
	}
}
