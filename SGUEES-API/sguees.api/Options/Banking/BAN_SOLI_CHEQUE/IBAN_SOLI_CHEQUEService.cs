using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_SOLI_CHEQUEService
	{
		Task<CResult> GetAllAsync(BAN_SOLI_CHEQUEParam xWhere);
		Task<CResult> GetAsync(BAN_SOLI_CHEQUEParam xWhere);
		Task<CResult> CreateAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> EnviarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CancelarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AutorizarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
