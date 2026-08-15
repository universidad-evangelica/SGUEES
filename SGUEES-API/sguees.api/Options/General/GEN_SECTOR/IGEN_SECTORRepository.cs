using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface IGEN_SECTORRepository
	{
		Task<CResult> GetAllAsync(List<CParameter> xWhere);
	}
}
