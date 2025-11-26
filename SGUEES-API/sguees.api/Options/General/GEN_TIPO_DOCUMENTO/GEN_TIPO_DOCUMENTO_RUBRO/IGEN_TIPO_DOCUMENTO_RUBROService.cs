using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface IGEN_TIPO_DOCUMENTO_RUBROService
	{
		Task<CResult> GetAllAsync(GEN_TIPO_DOCUMENTO_RUBROParam xWhere);
		Task<CResult> GetAsync(GEN_TIPO_DOCUMENTO_RUBROParam xWhere);
		Task<CResult> CreateAsync(GEN_TIPO_DOCUMENTO_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(GEN_TIPO_DOCUMENTO_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(GEN_TIPO_DOCUMENTO_RUBROTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
