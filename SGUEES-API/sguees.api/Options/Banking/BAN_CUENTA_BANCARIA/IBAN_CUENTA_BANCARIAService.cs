using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;
using sguees.Repositories;

namespace sguees.Services
{
	public interface IBAN_CUENTA_BANCARIAService
	{
		Task<CResult> GetAllAsync(BAN_CUENTA_BANCARIAParam xWhere);
		Task<CResult> GetAsync(BAN_CUENTA_BANCARIAParam xWhere);
		Task<CResult> CreateAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_CUENTA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
