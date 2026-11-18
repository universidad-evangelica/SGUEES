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
		private readonly IGEN_EMPLEADORepository _empleadoRepo;

		public GEN_EMPLEADO_PUESTOService(
			IGEN_EMPLEADO_PUESTORepository repo,
			IGEN_EMPLEADORepository empleadoRepo)
		{
			_repo = repo ?? throw new System.ArgumentNullException(nameof(repo));
			_empleadoRepo = empleadoRepo ?? throw new System.ArgumentNullException(nameof(empleadoRepo));
		}

		public async Task<CResult> GetAllAsync(
			GEN_EMPLEADO_PUESTOParam xWhere,
			int corrEmpresa,
			string login)
		{
			var corrEmpleado = xWhere?.CORR_EMPLEADO ?? 0;
			if (corrEmpleado <= 0)
			{
				return Error("Debe seleccionar un empleado válido.");
			}

			if (!await _empleadoRepo.PuedeVerEmpleadoAsync(corrEmpresa, corrEmpleado, login))
			{
				return Error("No tiene acceso a los puestos de este empleado.");
			}

			return await _repo.GetAllAsync(corrEmpleado, corrEmpresa);
		}

		public async Task<CResult> SaveAllAsync(
			int corrEmpleado,
			List<GEN_EMPLEADO_PUESTOTable> Data,
			int corrEmpresa,
			string vLOGIN_SISTEMA,
			string vESTACION)
		{
			if (!await _empleadoRepo.PuedeVerEmpleadoAsync(corrEmpresa, corrEmpleado, vLOGIN_SISTEMA))
			{
				return Error("No tiene acceso a los puestos de este empleado.");
			}

			return await _repo.SaveAllAsync(corrEmpleado, Data, corrEmpresa, vLOGIN_SISTEMA, vESTACION);
		}

		// Qué hace: obtiene empleados activos de una unidad y puesto específico.
		// Cómo lo hace: delega la consulta a GetEmpleadosSustitutosAsync en el repositorio.
		public async Task<CResult> GetEmpleadosSustitutosAsync(int corrUnidad, int corrPuesto, int corrEmpresa, string login)
		{
			if (!await _empleadoRepo.PuedeVerUnidadAsync(corrEmpresa, corrUnidad, login))
			{
				return Error("No tiene acceso a los empleados de esta unidad.");
			}

			return await _repo.GetEmpleadosSustitutosAsync(corrUnidad, corrPuesto, corrEmpresa);
		}

		private static CResult Error(string message)
			=> new()
			{
				Result = false,
				ErrorCode = -403,
				ErrorMessage = message,
			};
	}
}
