using System.Threading.Tasks;
using eFramework.Core;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Services
{
	public interface ICOM_PAGOService
	{
		Task<CResult> GetAllAsync(COM_PAGOParam xWhere);
		Task<CResult> GetAsync(COM_PAGOParam xWhere);
		Task<CResult> CreateAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> UpdateAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DeleteAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> BorrarDetalleAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesAplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllDesAplicarAsync(COM_PAGOParam xWhere);
		Task<CResult> AnularAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActualizarCuentaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AsignarArchivoAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllDocAsync(COM_PAGOParam xWhere);
		Task<CResult> GetBeneficiarioAsync(COM_PAGOParam xWhere);
		Task<CResult> GenerarContaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
