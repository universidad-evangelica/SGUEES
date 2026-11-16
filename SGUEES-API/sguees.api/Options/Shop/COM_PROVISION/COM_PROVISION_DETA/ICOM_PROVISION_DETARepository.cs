using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_PROVISION_DETARepository : IRepository<COM_PROVISION_DETATable>
	{
		Task<CResult> GetAllDisponiblesAsync(List<CParameter> xWhere);
	}
}
