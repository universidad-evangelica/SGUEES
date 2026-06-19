using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_CENTRO_COSTOService
	{
		Task<CResult> GetAllAsync(CON_CENTRO_COSTOParam xWhere);
		Task<CResult> GetAsync(CON_CENTRO_COSTOParam xWhere);
		Task<CResult> CreateAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ImportarExcelAsync(CON_CENTRO_COSTO_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
