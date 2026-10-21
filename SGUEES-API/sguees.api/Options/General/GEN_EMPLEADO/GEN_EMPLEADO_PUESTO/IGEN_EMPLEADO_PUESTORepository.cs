// Qué hace: contrato del repositorio de puestos del empleado.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_EMPLEADO_PUESTORepository
	{
		Task<CResult> GetAllAsync(int corrEmpleado, int corrEmpresa);
		Task<CResult> SaveAllAsync(int corrEmpleado, List<GEN_EMPLEADO_PUESTOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		// Qué hace: obtiene empleados activos asignados a una unidad y puesto específico.
		// Cómo lo hace: consulta GEN_EMPLEADO_PUESTO cruzando con V_GEN_EMPLEADO.
		Task<CResult> GetEmpleadosSustitutosAsync(int corrUnidad, int corrPuesto, int corrEmpresa);
	}
}
