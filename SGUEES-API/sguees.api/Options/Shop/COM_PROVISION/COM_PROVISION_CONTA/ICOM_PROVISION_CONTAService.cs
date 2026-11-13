using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PROVISION_CONTAService
	{
		Task<CResult> GetAllAsync(COM_PROVISION_CONTAParam xWhere);
		Task<CResult> GetAsync(COM_PROVISION_CONTAParam xWhere);
		Task<CResult> CreateAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PROVISION_CONTATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
