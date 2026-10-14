// Qué hace: contrato del repositorio de referencias laborales.
// Cómo lo hace: GetAll por persona y SaveAll (lista Table).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_REFERENCIA_LABORALRepository
	{
		Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_REFERENCIA_LABORALTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
