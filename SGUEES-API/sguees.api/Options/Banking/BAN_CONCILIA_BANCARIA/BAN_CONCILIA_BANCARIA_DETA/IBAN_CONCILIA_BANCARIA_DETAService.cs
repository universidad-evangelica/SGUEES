using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_CONCILIA_BANCARIA_DETAService
	{
		Task<CResult> GetAllAsync(BAN_CONCILIA_BANCARIA_DETAParam xWhere);
		Task<CResult> GetAsync(BAN_CONCILIA_BANCARIA_DETAParam xWhere);
		Task<CResult> CreateAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_CONCILIA_BANCARIA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
