using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_PARTIDA_MODELOService
	{
		Task<CResult> GetAllAsync(CON_PARTIDA_MODELOParam xWhere);
		Task<CResult> GetAsync(CON_PARTIDA_MODELOParam xWhere);
		Task<CResult> CreateAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_PARTIDA_MODELOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
