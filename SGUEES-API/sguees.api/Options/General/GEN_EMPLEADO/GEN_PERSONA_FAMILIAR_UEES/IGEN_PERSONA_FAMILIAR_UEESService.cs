// Qué hace: contrato del servicio de familiares UEES (tab Adicional de empleado).
// Cómo lo hace: GetAll + SaveAll con lista Table (estándar Param/Table/View).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_FAMILIAR_UEESService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_FAMILIAR_UEESParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_FAMILIAR_UEESTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
