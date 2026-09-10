using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;

namespace SGUEES.Repositories
{
	public interface ISC_BANDEJA_TH_REQUISICIONRepository
	{
		Task<CResult> GetRequisicionesPagedAsync(List<CParameter> xWhere);
		Task<CResult> GetBitacoraRequisicionAsync(List<CParameter> xWhere);
	}
}
