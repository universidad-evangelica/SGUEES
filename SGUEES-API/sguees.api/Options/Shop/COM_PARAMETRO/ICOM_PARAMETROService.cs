using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PARAMETROService
	{
		Task<CResult> GetAllAsync(COM_PARAMETROParam xWhere);
		Task<CResult> GetAsync(COM_PARAMETROParam xWhere);
		Task<CResult> CreateAsync(COM_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
