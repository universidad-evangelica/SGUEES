using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_PARTIDA_MODELO_DETAService
	{
		Task<CResult> GetAllAsync(CON_PARTIDA_MODELO_DETAParam xWhere);
		Task<CResult> GetAsync(CON_PARTIDA_MODELO_DETAParam xWhere);
		Task<CResult> CreateAsync(CON_PARTIDA_MODELO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_PARTIDA_MODELO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_PARTIDA_MODELO_DETATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
