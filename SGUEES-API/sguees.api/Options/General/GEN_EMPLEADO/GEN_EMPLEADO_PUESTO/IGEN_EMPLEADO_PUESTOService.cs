// Qué hace: contrato del servicio de puestos del empleado (tab Puestos).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_EMPLEADO_PUESTOService
	{
		Task<CResult> GetAllAsync(GEN_EMPLEADO_PUESTOParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(int corrEmpleado, List<GEN_EMPLEADO_PUESTOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: obtiene empleados activos asignados a una unidad y puesto específico.
		// Cómo lo hace: delega la consulta al repositorio de puestos del empleado.
		Task<CResult> GetEmpleadosSustitutosAsync(int corrUnidad, int corrPuesto, int corrEmpresa);
	}
}
