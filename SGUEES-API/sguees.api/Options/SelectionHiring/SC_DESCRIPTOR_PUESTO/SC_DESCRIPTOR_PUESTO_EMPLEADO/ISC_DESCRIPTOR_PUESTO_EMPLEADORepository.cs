// Qué hace: contrato de datos de empleados cargados en el descriptor.
// Cómo lo hace: usa el repositorio base y agrega el listado de empleados que aplican.
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_DESCRIPTOR_PUESTO_EMPLEADORepository : IRepository<SC_DESCRIPTOR_PUESTO_EMPLEADOTable>
	{
		Task<CResult> CambiarActivoAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> InactivarCargasPorDescriptorAsync(int corrEmpresa, int corrDescriptor, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetDisponiblesAsync(int corrEmpresa, int corrDescriptor);
		Task<CResult> GetPorEmpleadoAsync(int corrEmpresa, int corrEmpleado);
		Task<CResult> GetDisponiblesPorEmpleadoAsync(int corrEmpresa, int corrEmpleado);
	}
}
