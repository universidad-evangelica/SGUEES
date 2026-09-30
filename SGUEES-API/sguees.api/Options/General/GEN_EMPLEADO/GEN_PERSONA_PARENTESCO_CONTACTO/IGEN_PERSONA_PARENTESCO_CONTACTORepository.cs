// Qué hace: contrato del repositorio de personas de contacto del empleado.
// Cómo lo hace: GetAll por persona y SaveAll de la lista.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_PARENTESCO_CONTACTORepository
	{
		Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_PARENTESCO_CONTACTOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
