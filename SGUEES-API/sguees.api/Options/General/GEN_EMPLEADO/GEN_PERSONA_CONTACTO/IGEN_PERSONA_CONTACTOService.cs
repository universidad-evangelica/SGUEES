// Qué hace: contrato del servicio de contactos (tab Contactos de empleado).
// Cómo lo hace: GetAll merge + SaveAll con lista Table.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_CONTACTOService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_CONTACTOParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_CONTACTOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
