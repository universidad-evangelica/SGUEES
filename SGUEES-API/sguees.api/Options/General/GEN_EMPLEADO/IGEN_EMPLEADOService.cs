// Qué hace: contrato del servicio GEN_EMPLEADO.
// Cómo lo hace: browse + Iniciar (SP persona natural + empleado) + CRUD personales vía SP.
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_EMPLEADOService
	{
		Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere);
		Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere);
		Task<CResult> IniciarAsync(GEN_PERSONA_NATURALTable natural, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetPersonaNaturalAsync(GEN_PERSONA_NATURALParam xWhere);
		Task<CResult> CreatePersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdatePersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeletePersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CreateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_EMPLEADOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
