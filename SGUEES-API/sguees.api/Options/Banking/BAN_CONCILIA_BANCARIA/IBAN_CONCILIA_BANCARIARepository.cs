using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_CONCILIA_BANCARIARepository : IRepository<BAN_CONCILIA_BANCARIATable>
	{
		Task<CResult> GetPendientesAsync(List<CParameter> xWhere);
		Task<CResult> GetResumenAsync(List<CParameter> xWhere);
		Task<CResult> GetMoviAsync(List<CParameter> xWhere);
		Task<CResult> AplicarAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesAplicarAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarConciliacionAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ReconstruirMovimientosAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ForzarConciliacionAsync(BAN_CONCILIA_FORZADAParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> RevertirConciliacionAsync(BAN_CONCILIA_REVERTIRParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> MarcarConciliadoAsync(BAN_CONCILIA_FORZADAParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ImportarExcelAsync(BAN_CONCILIA_BANCARIA_IMPORTParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
