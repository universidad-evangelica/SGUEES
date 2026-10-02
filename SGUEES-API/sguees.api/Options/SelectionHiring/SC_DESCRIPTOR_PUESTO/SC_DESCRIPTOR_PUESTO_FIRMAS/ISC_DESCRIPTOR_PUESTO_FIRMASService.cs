// Qué hace: contrato para consultar las firmas del descriptor.
// Cómo lo hace: delega el listado al repositorio.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_DESCRIPTOR_PUESTO_FIRMASService
	{
		Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_FIRMASParam xWhere);
	}
}
