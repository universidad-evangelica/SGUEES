using eFramework.Data;
using eFramework.Core;
using sguees.Models;
namespace sguees.Repositories
{
	public interface ICOM_SOLI_COTIZACION_PROVEEDORRepository: IRepository<COM_SOLI_COTIZACION_PROVEEDORTable>
	{
		// =======================> PROVEEDORES DISPONIBLE <======================= \\
		Task<CResult> GetAllPROVEEDOR_DISPONIBLE(List<CParameter> xWhere);
		Task<CResult> AnularAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> HabilitarAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GenerarCotizacionAsync(COM_SOLI_COTIZACION_PROVEEDORTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetCorreoProveedorCotizaAsync(List<CParameter> xWhere);
		Task<CResult> ExisteProveedor(List<CParameter> xWhere);
	}
}
