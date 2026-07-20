using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_CONCILIA_BANCARIAService
	{
		Task<CResult> GetAllAsync(BAN_CONCILIA_BANCARIAParam xWhere);
		Task<CResult> GetAsync(BAN_CONCILIA_BANCARIAParam xWhere);
		Task<CResult> CreateAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_CONCILIA_BANCARIATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetPendientesAsync(BAN_CONCILIA_BANCARIAParam xWhere);
		Task<CResult> GetResumenAsync(BAN_CONCILIA_BANCARIAParam xWhere);
		Task<CResult> GetMoviAsync(BAN_CONCILIA_BANCARIAParam xWhere);
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
