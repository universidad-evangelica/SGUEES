using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_CATALOGO_CUENTA_CENTRO_COSTOService
	{
		Task<CResult> GetAllAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOParam xWhere);
		Task<CResult> GetAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOParam xWhere);
		Task<CResult> CreateAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CATALOGO_CUENTA_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
