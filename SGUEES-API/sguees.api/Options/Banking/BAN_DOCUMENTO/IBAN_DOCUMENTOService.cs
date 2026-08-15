using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_DOCUMENTOService
	{
		Task<CResult> GetAllAsync(BAN_DOCUMENTOParam xWhere);
		Task<CResult> GetAsync(BAN_DOCUMENTOParam xWhere);
		Task<CResult> CreateAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AplicarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ImprimirChequeAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetChequeImprimirDatosAsync(BAN_DOCUMENTOParam xWhere);
		Task<CResult> GetAllContabilizarAsync(BAN_DOCUMENTOParam xWhere);
		Task<CResult> ContabilizarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesContabilizarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
