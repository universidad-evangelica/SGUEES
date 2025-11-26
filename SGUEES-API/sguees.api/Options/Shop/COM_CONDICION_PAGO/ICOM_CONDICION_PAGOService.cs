using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_CONDICION_PAGOService
	{
		Task<CResult> GetAllAsync(COM_CONDICION_PAGOParam xWhere);
		Task<CResult> GetAsync(COM_CONDICION_PAGOParam xWhere);
		Task<CResult> CreateAsync(COM_CONDICION_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_CONDICION_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_CONDICION_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetCondicionesPagoAsync(COM_CONDICION_PAGOParam xWhere);
	}
}
