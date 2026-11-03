using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IACA_SE_SECCIONService
	{
		Task<CResult> GetAllAsync(ACA_SE_SECCIONParam xWhere);
		Task<CResult> GetAsync(ACA_SE_SECCIONParam xWhere);
		Task<CResult> CreateAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(ACA_SE_SECCIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetSeccionesActivasAsync();
	}
}
