using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_SOLI_CHEQUE_DETAService
	{
		Task<CResult> GetAllAsync(BAN_SOLI_CHEQUE_DETAParam xWhere);
		Task<CResult> GetAsync(BAN_SOLI_CHEQUE_DETAParam xWhere);
		Task<CResult> CreateAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_SOLI_CHEQUE_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
