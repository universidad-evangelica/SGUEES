using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IBAN_LINEA_TRABAJO_CONCILIACIONService
	{
		Task<CResult> GetAllAsync(BAN_LINEA_TRABAJO_CONCILIACIONParam xWhere);
		Task<CResult> GetAsync(BAN_LINEA_TRABAJO_CONCILIACIONParam xWhere);
		Task<CResult> CreateAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActivarInactivarAsync(BAN_LINEA_TRABAJO_CONCILIACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
