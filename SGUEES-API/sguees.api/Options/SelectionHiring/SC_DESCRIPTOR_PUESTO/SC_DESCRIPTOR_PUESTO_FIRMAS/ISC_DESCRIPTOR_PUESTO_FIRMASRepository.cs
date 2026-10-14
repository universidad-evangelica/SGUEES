// Qué hace: contrato de lectura y alta de firmas del descriptor.
// Cómo lo hace: lista las filas guardadas y copia la última aprobación al quedar Activo.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_DESCRIPTOR_PUESTO_FIRMASRepository
	{
		Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_FIRMASParam xWhere);
		Task GuardarAlQuedarActivoAsync(int corrEmpresa, int corrDescriptor, string login);
	}
}
