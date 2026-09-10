using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_BANDEJA_ACTORES_CANDIDATOService
	{
		Task<CResult> GetCandidatosAsync(SC_BANDEJA_ACTORES_CANDIDATOParam xWhere);
		Task<int> CountCandidatosPendientesAsync(int corrEmpresa, string loginSistema);
	}
}
