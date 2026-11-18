// Qué hace: contrato del repositorio GEN_EMPLEADO.
// Cómo lo hace: CRUD empleado + mantenimiento núcleo vía PRAL_MTTO_GEN_EMPLEADO.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_EMPLEADORepository : IRepository<GEN_EMPLEADOTable>
	{
		Task<CResult> GetAllVisibleAsync(int corrEmpresa, string login, int? corrEmpleado = null);
		Task<CResult> GetVisibleAsync(int corrEmpresa, int corrEmpleado, string login);
		Task<bool> PuedeVerEmpleadoAsync(int corrEmpresa, int corrEmpleado, string login);
		Task<bool> PuedeVerUnidadAsync(int corrEmpresa, int corrUnidad, string login);
		Task<bool> PuedeVerPersonaAsync(int corrEmpresa, long? corrPersona, long? corrPersonaNatural, string login);
		Task<CResult> GetPersonaNaturalAsync(List<CParameter> xWhere);
		Task<CResult> MttoEmpleadoAsync(GEN_EMPLEADO_MTTOTable Data, int tipoActualiza, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
