using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICON_TIPO_CENTRO_COSTOService
	{
		Task<CResult> GetAllAsync(CON_TIPO_CENTRO_COSTOParam xWhere);
		Task<CResult> GetAsync(CON_TIPO_CENTRO_COSTOParam xWhere);
		Task<CResult> CreateAsync(CON_TIPO_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(CON_TIPO_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(CON_TIPO_CENTRO_COSTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
