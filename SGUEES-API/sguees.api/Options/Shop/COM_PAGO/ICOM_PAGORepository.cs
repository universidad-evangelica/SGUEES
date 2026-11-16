using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Repositories
{
	public interface ICOM_PAGORepository : IRepository<COM_PAGOTable>
	{
		Task<CResult> GetAllDataAsync(List<CParameter> xWhere);
		Task<CResult> GetAllDesAplicarAsync(List<CParameter> xWhere);
		Task<CResult> GetAllDocAsync(List<CParameter> xWhere);
		Task<CResult> GetBeneficiarioAsync(List<CParameter> xWhere);
		Task<CResult> BorrarDetalleAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> DesAplicarAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AnularAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> ActualizarCuentaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> AsignarArchivoAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarContaAsync(COM_PAGOTable Data, string vLOGIN_SISTEMA, string vESTACION);
	}
}
