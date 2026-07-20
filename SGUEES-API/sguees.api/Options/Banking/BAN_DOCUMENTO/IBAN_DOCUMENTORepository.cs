using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_DOCUMENTORepository : IRepository<BAN_DOCUMENTOTable>
	{
		Task<CResult> AplicarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ImprimirChequeAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetChequeImprimirDatosAsync(List<CParameter> xWhere);
		Task<CResult> ContabilizarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesContabilizarAsync(BAN_DOCUMENTOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
