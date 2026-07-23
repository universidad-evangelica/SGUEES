using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISEG_SISTEMAService
	{
		Task<CResult> GetAllAsync(SEG_SISTEMAParam xWhere);
		Task<CResult> GetAsync(SEG_SISTEMAParam xWhere);
	}
}
