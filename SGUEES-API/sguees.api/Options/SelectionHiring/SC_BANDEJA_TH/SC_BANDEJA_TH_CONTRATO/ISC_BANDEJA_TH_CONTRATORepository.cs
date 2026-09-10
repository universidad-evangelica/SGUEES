using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;

namespace SGUEES.Repositories
{
	public interface ISC_BANDEJA_TH_CONTRATORepository
	{
		Task<CResult> GetContratacionesPagedAsync(List<CParameter> xWhere);
	}
}
