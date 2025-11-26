using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface IGEN_TIPO_GASTOService
	{
		Task<CResult> GetAllAsync(GEN_TIPO_GASTOParam xWhere);
		Task<CResult> GetAsync(GEN_TIPO_GASTOParam xWhere);
		Task<CResult> CreateAsync(GEN_TIPO_GASTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_TIPO_GASTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_TIPO_GASTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetTipoGastosAsync(GEN_TIPO_GASTOParam xWhere);
	}
}
