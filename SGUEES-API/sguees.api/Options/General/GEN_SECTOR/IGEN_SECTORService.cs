using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_SECTORService
	{
		Task<CResult> GetAllAsync(GEN_SECTORParam xWhere);
	}
}
