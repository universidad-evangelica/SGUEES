// Qué hace: contrato del repositorio de documentos de identidad de persona.
// Cómo lo hace: GetAll (merge catálogo+valores) y SaveAll (lista Table) — patrón sc-descriptor-puesto.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADRepository
	{
		Task<CResult> GetAllAsync(long corrPersona, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
