using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_REQUISICION_CANDIDATOService
	{
		Task<CResult> DecideAsync(SC_REQUISICION_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetPostulacionesExpedienteAsync(SC_REQUISICION_CANDIDATOParam xWhere);
	}
}
