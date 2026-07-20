using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface IGEN_EMPLEADOService
	{
		Task<CResult> GetAllAsync(GEN_EMPLEADOParam xWhere);
		Task<CResult> GetAsync(GEN_EMPLEADOParam xWhere);
	}
}
