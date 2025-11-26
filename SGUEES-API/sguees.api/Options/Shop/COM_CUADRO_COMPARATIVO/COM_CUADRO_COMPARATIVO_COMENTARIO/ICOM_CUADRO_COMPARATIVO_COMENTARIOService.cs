using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_CUADRO_COMPARATIVO_COMENTARIOService
	{
		Task<CResult> GetAllAsync(COM_CUADRO_COMPARATIVO_COMENTARIOParam xWhere);
		Task<CResult> GetAsync(COM_CUADRO_COMPARATIVO_COMENTARIOParam xWhere);
		Task<CResult> CreateAsync(COM_CUADRO_COMPARATIVO_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CUADRO_COMPARATIVO_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CUADRO_COMPARATIVO_COMENTARIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
