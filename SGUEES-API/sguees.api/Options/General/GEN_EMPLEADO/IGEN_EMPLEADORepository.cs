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
		Task<CResult> GetPersonaNaturalAsync(List<CParameter> xWhere);
		Task<CResult> MttoEmpleadoAsync(GEN_EMPLEADO_MTTOTable Data, int tipoActualiza, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
