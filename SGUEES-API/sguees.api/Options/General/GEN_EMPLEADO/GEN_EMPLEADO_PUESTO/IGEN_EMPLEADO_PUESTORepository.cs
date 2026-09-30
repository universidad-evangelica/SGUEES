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
	}
}
