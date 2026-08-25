using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_EXPEDIENTE_CANDIDATOService
	{
		Task<CResult> GetAllAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere);
		Task<CResult> GetAsync(SC_EXPEDIENTE_CANDIDATOParam xWhere);
		Task<CResult> CreateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(SC_EXPEDIENTE_CANDIDATOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetEstadoAsociacionAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AsociarSolicitudAsync(SC_EXPEDIENTE_ASOCIARParam Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
