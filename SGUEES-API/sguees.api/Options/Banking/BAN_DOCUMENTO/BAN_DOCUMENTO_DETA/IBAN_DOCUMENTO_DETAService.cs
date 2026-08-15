using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_DOCUMENTO_DETAService
	{
		Task<CResult> GetAllAsync(BAN_DOCUMENTO_DETAParam xWhere);
		Task<CResult> GetAsync(BAN_DOCUMENTO_DETAParam xWhere);
		Task<CResult> CreateAsync(BAN_DOCUMENTO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_DOCUMENTO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_DOCUMENTO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
