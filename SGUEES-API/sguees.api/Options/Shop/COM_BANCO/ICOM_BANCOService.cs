using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_BANCOService
	{
		Task<CResult> GetAllAsync(COM_BANCOParam xWhere);
		Task<CResult> GetAsync(COM_BANCOParam xWhere);
		Task<CResult> CreateAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_BANCOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
