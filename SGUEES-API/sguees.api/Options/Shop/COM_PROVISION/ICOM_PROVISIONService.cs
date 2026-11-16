using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Services
{
	public interface ICOM_PROVISIONService
	{
		Task<CResult> GetAllAsync(COM_PROVISIONParam xWhere);
		Task<CResult> GetAsync(COM_PROVISIONParam xWhere);
		Task<CResult> CreateAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AplicarAsync(COM_PROVISIONTable Data);
		Task<CResult> AnularAsync(COM_PROVISIONTable Data);
		Task<CResult> DesAplicarAsync(COM_PROVISIONTable Data);
		Task<CResult> BorrarDetalleAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarContaAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllDesAplicarAsync(COM_PROVISIONParam xWhere);
	}
}
