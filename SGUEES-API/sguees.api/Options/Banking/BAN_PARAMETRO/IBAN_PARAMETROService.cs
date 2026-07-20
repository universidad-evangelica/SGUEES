using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_PARAMETROService
	{
		Task<CResult> GetAllAsync(BAN_PARAMETROParam xWhere);
		Task<CResult> GetAsync(BAN_PARAMETROParam xWhere);
		Task<CResult> CreateAsync(BAN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
