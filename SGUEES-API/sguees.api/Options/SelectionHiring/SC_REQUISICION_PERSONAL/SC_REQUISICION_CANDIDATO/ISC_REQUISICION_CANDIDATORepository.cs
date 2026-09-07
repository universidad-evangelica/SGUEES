using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_REQUISICION_CANDIDATORepository : IRepository<SC_REQUISICION_CANDIDATOTable>
	{
		Task<CResult> DecideAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere);
	}
}
