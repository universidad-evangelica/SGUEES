// Qué hace: contrato del servicio de carga de empleados del descriptor.
// Cómo lo hace: lista, valida contra GEN_EMPLEADO_PUESTO y elimina el vínculo.
using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_DESCRIPTOR_PUESTO_EMPLEADOService
	{
		Task<CResult> GetAllAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere);
		Task<CResult> GetDisponiblesAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOParam xWhere);
		Task<CResult> CreateAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_DESCRIPTOR_PUESTO_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
