using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface IPLA_TIPO_DOCUMENTO_ADJUNTOService
	{
		Task<CResult> GetAllAsync(PLA_TIPO_DOCUMENTO_ADJUNTOParam xWhere);
		Task<CResult> GetAsync(PLA_TIPO_DOCUMENTO_ADJUNTOParam xWhere);
		Task<CResult> CreateAsync(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(PLA_TIPO_DOCUMENTO_ADJUNTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
