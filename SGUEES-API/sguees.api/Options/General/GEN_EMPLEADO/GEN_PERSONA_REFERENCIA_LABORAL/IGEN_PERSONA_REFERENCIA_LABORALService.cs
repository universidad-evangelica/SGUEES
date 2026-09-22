// Qué hace: contrato del servicio de referencias laborales (tab gen-empleado).
// Cómo lo hace: GetAll + SaveAll con lista Table.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_PERSONA_REFERENCIA_LABORALService
	{
		Task<CResult> GetAllAsync(GEN_PERSONA_REFERENCIA_LABORALParam xWhere, int corrEmpresa);
		Task<CResult> SaveAllAsync(long corrPersona, List<GEN_PERSONA_REFERENCIA_LABORALTable> Data, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
