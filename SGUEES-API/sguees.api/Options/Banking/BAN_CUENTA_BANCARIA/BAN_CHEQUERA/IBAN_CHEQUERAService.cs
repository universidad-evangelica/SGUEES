using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_CHEQUERAService
	{
		Task<CResult> GetAllAsync(BAN_CHEQUERAParam xWhere);
		Task<CResult> GetAsync(BAN_CHEQUERAParam xWhere);
		Task<CResult> CreateAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_CHEQUERATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetActivaPorCuentaAsync(BAN_CHEQUERAParam xWhere);
	}
}
