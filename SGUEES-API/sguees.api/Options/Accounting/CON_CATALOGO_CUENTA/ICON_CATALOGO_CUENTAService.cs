using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_CATALOGO_CUENTAService
	{
		Task<CResult> GetAllAsync(CON_CATALOGO_CUENTAParam xWhere);
		Task<CResult> GetAsync(CON_CATALOGO_CUENTAParam xWhere);
		Task<CResult> CreateAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CATALOGO_CUENTATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ImportarExcelAsync(CON_CATALOGO_CUENTA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
