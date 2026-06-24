using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_PARTIDA_DETAService
	{
		Task<CResult> GetAllAsync(CON_PARTIDA_DETAParam xWhere);
		Task<CResult> GetAsync(CON_PARTIDA_DETAParam xWhere);
		Task<CResult> CreateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_PARTIDA_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
