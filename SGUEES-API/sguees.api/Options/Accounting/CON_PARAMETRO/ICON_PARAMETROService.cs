using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_PARAMETROService
	{
		Task<CResult> GetAllAsync(CON_PARAMETROParam xWhere);
		Task<CResult> GetAsync(CON_PARAMETROParam xWhere);
		Task<CResult> CreateAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_PARAMETROTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
