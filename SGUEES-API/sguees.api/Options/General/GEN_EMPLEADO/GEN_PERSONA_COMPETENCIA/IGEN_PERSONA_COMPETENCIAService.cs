// Qué hace: contrato del servicio de competencias (tab Competencias de empleado).
// Cómo lo hace: GetAll + SaveAll con lista Table (estándar Param/Table/View).
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_COMPETENCIAService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_COMPETENCIAParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_COMPETENCIATable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
