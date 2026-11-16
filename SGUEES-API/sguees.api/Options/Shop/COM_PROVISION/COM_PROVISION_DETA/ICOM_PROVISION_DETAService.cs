using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PROVISION_DETAService
	{
		Task<CResult> GetAllAsync(COM_PROVISION_DETAParam xWhere);
		Task<CResult> GetAsync(COM_PROVISION_DETAParam xWhere);
		Task<CResult> GetAllDisponiblesAsync(COM_PROVISION_DETAParam xWhere);
		Task<CResult> CreateAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PROVISION_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
