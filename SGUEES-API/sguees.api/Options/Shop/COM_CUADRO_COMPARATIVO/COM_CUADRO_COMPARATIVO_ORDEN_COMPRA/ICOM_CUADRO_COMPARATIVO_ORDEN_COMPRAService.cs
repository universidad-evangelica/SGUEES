using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_CUADRO_COMPARATIVO_ORDEN_COMPRAService
	{
		Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam xWhere);
		Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam xWhere);
		Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<Stream> GetPDFAsync(COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam xWhere);
	}
}
