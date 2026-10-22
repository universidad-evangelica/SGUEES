// Qué hace: contrato del lookup de períodos para Documentos por período.
// Cómo: devuelve los períodos de la empresa de la sesión.
using System.Threading.Tasks;
using eFramework.Core;

namespace SGUEES.Services
{
	public interface IACA_PERIODOS_ACADEMICOSDocumentoService
	{
		Task<CResult> GetPeriodosAsync(int corrEmpresa);
	}
}
