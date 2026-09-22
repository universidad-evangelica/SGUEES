// Qué hace: contrato del servicio de hijos (tab Familiares de empleado).
// Cómo lo hace: GetAll + SaveAll con lista Table (estándar Param/Table/View).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_HIJOSService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_HIJOSParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_HIJOSTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
