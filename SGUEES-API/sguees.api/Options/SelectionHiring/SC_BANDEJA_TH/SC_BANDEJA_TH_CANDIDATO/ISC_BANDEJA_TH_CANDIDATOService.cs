using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_BANDEJA_TH_CANDIDATOService
	{
		Task<CResult> GetCandidatosAsync(SC_BANDEJA_TH_CANDIDATOParam xWhere);
	}
}
