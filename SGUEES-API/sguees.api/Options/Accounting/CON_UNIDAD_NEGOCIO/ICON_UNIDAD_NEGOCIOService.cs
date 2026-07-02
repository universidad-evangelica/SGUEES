using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_UNIDAD_NEGOCIOService
	{
		Task<CResult> GetAllAsync(CON_UNIDAD_NEGOCIOParam xWhere);
		Task<CResult> GetAsync(CON_UNIDAD_NEGOCIOParam xWhere);
		Task<CResult> CreateAsync(CON_UNIDAD_NEGOCIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_UNIDAD_NEGOCIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_UNIDAD_NEGOCIOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
