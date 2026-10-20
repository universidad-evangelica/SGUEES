// Qué hace: contrato del repositorio de familiares de persona.
// Cómo lo hace: GetAll por persona y SaveAll (lista Table) — patrón documentos.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_FAMILIARRepository
	{
		Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_FAMILIARTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
