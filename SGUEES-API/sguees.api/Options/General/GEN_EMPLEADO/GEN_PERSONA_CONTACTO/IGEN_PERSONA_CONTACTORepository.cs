// Qué hace: contrato del repositorio de contactos de persona.
// Cómo lo hace: GetAll (merge catálogo+valores) y SaveAll (lista Table).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_CONTACTORepository
	{
		Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_CONTACTOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
