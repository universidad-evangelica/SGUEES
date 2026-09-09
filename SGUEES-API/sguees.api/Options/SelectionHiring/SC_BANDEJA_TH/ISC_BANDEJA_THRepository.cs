using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using SGUEES.Models;

namespace SGUEES.Repositories
{
	public interface ISC_BANDEJA_THRepository
	{
		Task<CResult> GetRequisicionesPagedAsync(List<CParameter> xWhere);
		Task<CResult> GetBitacoraRequisicionAsync(List<CParameter> xWhere);
	}
}
