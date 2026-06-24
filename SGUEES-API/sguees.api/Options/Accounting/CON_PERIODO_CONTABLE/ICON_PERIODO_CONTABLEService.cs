using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_PERIODO_CONTABLEService
	{
		Task<CResult> GetAllAsync(CON_PERIODO_CONTABLEParam xWhere);
		Task<CResult> GetAsync(CON_PERIODO_CONTABLEParam xWhere);
		Task<CResult> CreateAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_PERIODO_CONTABLETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarCierreAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarAperturaAsync(CON_PERIODO_CONTABLEOperacionTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
