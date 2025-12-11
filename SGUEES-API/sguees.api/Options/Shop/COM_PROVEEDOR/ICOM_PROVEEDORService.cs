using System.Threading.Tasks;
using eFramework.Core;
using sguees.Models;

namespace sguees.Services
{
	public interface ICOM_PROVEEDORService
	{
		Task<CResult> GetAllAsync(COM_PROVEEDORParam xWhere);
		Task<CResult> GetAsync(COM_PROVEEDORParam xWhere);
		Task<CResult> CreateAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetProveedorActuAsync(COM_PROVEEDORParam xWhere);
		Task<CResult> UpdateConEnvioCorreoAsync(COM_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION,int CORR_EMPRESA,string UserName);
		Task<CResult> GetProveedoresAsync(COM_PROVEEDORParam xWhere);
		Task<CResult> GetProveedoresComprasAsync(COM_PROVEEDORParam xWhere);
	}
}
