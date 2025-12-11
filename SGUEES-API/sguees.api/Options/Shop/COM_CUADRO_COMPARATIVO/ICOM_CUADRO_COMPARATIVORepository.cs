using eFramework.Data;
using eFramework.Core;
using sguees.Models;

namespace sguees.Repositories
{
	public interface ICOM_CUADRO_COMPARATIVORepository: IRepository<COM_CUADRO_COMPARATIVOTable>
	{
		// =======================> SOLICITUD DE COTIZACION DISPONIBLE <======================= \\
		Task<CResult> GetAllSOLICITUD_COTIZACION_DISPONIBLE(List<CParameter> xWhere);
		Task<CResult> GetAllSOLICITUD_COTIZACION_DETA_DISPONIBLE(List<CParameter> xWhere);
		Task<CResult> COM_CUADRO_COMPARATIVO_GENERAR(COM_CUADRO_COMPARATIVO_SOLI_COTIZACIONTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> SolicitarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> getAllCOM_CUADRO_COMPARATIVO_PROVEEDOR(List<CParameter> xWhere);
		Task<CResult> GetComCuadroComparativoImpr(List<CParameter> xWhere);
		Task<CResult> AplicarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> GetAllCOM_CUADRO_COMPARATIVO_COTIZACION_DETAAsync(List<CParameter> xWhere);
		Task<CResult> GetAllSolicitadosAsync(List<CParameter> xWhere);
		Task<CResult> AutorizarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> UpdateAutorizarAsync(COM_CUADRO_COMPARATIVOTable Data, string vLOGIN_SISTEMA, string vESTACION);
		Task<CResult> GetComCuadroComparativoProeveedorCorreo(List<CParameter> xWhere);
		Task<bool> ValidarEnviarCorreo(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> RechazarAsync(COM_CUADRO_COMPARATIVOTable Data);
		Task<CResult> GetCorreoAutorizadores(List<CParameter> xWhere);
		Task<CResult> GetCotizacionesNormales(List<CParameter> xWhere);
		Task<CResult> GetComCuadroComparativoProeveedorCorreoUsuarioSoliCotizacion(List<CParameter> xWhere);
	}
}
