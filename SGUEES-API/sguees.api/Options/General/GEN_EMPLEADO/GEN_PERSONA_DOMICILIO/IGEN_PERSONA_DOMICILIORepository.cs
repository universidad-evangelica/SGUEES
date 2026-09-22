// Qué hace: contrato del repositorio de domicilios de persona.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_DOMICILIORepository
	{
		Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_DOMICILIOTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
