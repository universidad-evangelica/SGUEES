// Qué hace: contrato del servicio GEN_EMPLEADO.
// Cómo lo hace: browse + Iniciar/Personales vía PRAL_MTTO_GEN_EMPLEADO.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_EMPLEADOService
	{
		Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere, string login);
		Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere, string login);
		Task<CResult> IniciarAsync(GEN_EMPLEADO_MTTOTable data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetPersonaNaturalAsync(GEN_PERSONA_NATURALParam xWhere, int corrEmpresa, string login);
		Task<bool> PuedeVerPersonaAsync(int corrEmpresa, long? corrPersona, long? corrPersonaNatural, string login);
		Task<CResult> UpdatePersonalesAsync(GEN_EMPLEADO_MTTOTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
