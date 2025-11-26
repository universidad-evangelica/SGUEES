using System.Threading.Tasks;
using eFramework.Core;
using scuees.Models;

namespace scuees.Services
{
	public interface ICOM_BITACORAService
	{
		Task<CResult> GetAllAsync(COM_BITACORAParam xWhere);
		Task<CResult> GetAsync(COM_BITACORAParam xWhere);
		Task<CResult> CreateAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_BITACORATable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
