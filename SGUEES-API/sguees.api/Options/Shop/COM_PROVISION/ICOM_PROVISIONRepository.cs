using System.Collections.Generic;
using System.Threading.Tasks;
using eFramework.Core;
using eFramework.Data;
using eadmindevprojectmanagement.Models;

namespace eadmindevprojectmanagement.Repositories
{
	public interface ICOM_PROVISIONRepository : IRepository<COM_PROVISIONTable>
	{
		Task<CResult> AplicarAsync(COM_PROVISIONTable Data);
		Task<CResult> AnularAsync(COM_PROVISIONTable Data);
		Task<CResult> DesAplicarAsync(COM_PROVISIONTable Data);
		Task<CResult> BorrarDetalleAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarContaAsync(COM_PROVISIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetAllDesAplicarAsync(List<CParameter> xWhere);
	}
}
