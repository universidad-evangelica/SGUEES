// Qué hace: contrato del repositorio GEN_EMPLEADO.
// Cómo lo hace: CRUD empleado + mantenimiento persona natural vía SP.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_EMPLEADORepository : IRepository<GEN_EMPLEADOTable>
	{
		Task<CResult> GetPersonaNaturalAsync(List<CParameter> xWhere);
		Task<CResult> MttoPersonaNaturalAsync(GEN_PERSONA_NATURALTable Data, int tipoActualiza, int corrEmpresa, string vLOGIN_SISTEMA, string vESTACION);
	}
}
