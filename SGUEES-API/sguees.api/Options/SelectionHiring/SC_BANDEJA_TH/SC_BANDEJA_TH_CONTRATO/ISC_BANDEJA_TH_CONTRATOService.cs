using System.Threading.Tasks;
using eFramework.Core;
using SGUEES.Models;

namespace SGUEES.Services
{
	public interface ISC_BANDEJA_TH_CONTRATOService
	{
		Task<CResult> GetContratacionesAsync(SC_BANDEJA_TH_CONTRATOParam xWhere);
	}
}
