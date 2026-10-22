// Qué hace: contrato del catálogo de períodos que usa Documentos por período.
// Cómo: lee V_ACA_PERIODOS_MTTO de la empresa de la sesión.
using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;

namespace SGUEES.Repositories
{
	public interface IACA_PERIODOS_ACADEMICOSDocumentoRepository
	{
		Task<CResult> GetPeriodosAsync(List<CParameter> xWhere);
	}
}
