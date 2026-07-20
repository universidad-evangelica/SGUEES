using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ISEG_MENU_SISTEMAService
	{
		Task<CResult> GetAllAsync(SEG_MENU_SISTEMAParam xWhere);
		Task<CResult> GetAsync(SEG_MENU_SISTEMAParam xWhere);
	}
}
