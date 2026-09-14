using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	// Qué hace: contrato del servicio de niveles de centro de costo.
	public interface ICON_CENTRO_COSTO_NIVELService
	{
		Task<CResult> GetAllAsync(CON_CENTRO_COSTO_NIVELParam xWhere);
		Task<CResult> GetAsync(CON_CENTRO_COSTO_NIVELParam xWhere);
		Task<CResult> CreateAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_CENTRO_COSTO_NIVELTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
