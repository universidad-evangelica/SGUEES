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
		Task<CResult> GetDisponiblesAsync(int corrEmpresa, int corrDescriptor);
	}
}
