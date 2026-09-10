using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;

namespace SGUEES.Repositories
{
	public interface ISC_BANDEJA_TH_CANDIDATORepository
	{
		Task<CResult> GetCandidatosPagedAsync(List<CParameter> xWhere);
	}
}
