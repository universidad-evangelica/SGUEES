using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IBAN_SOLI_CHEQUERepository : IRepository<BAN_SOLI_CHEQUETable>
	{
		Task<CResult> EnviarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> CancelarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AutorizarSolicitudAsync(BAN_SOLI_CHEQUETable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
