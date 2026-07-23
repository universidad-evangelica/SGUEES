using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using sguees.Models;

namespace sguees.Repositories
{
	/// <summary>
	/// Puente API -> RPT para reportes contables.
	/// Cada reporte expone GetConXxxImprAsync -> Accounting/PostConXxxImpr (mismo patron que COM_REPORepository).
	/// </summary>
	public interface ICON_REPORepository
	{
		Task<Stream> GetConLibroDiarioAuxiliarImprAsync(List<LIBRO_DIARIO_AUXILIAR_IMPRView> data, string token);
		Task<Stream> GetConLibroDiarioAuxiliarMesImprAsync(List<LIBRO_DIARIO_AUXILIAR_MES_IMPRView> data, string token);
		Task<Stream> GetConLibroDiarioMayorImprAsync(List<LIBRO_DIARIO_MAYOR_IMPRView> data, string token);
		Task<Stream> GetConBalanceComprobacionImprAsync(List<BALANCE_COMPROBACION_IMPRView> data, string token);
		Task<Stream> GetConBalanceComprobacionMesImprAsync(List<BALANCE_COMPROBACION_MES_IMPRView> data, string token);
		Task<Stream> GetConBalanceGeneralImprAsync(List<BALANCE_GENERAL_IMPRView> data, string token);
		Task<Stream> GetConEstadoResultadosImprAsync(List<ESTADO_RESULTADOS_IMPRView> data, string token);
		Task<Stream> GetConBalanceGeneralVerticalImprAsync(List<BALANCE_GENERAL_VERTICAL_IMPRView> data, string token);
		Task<Stream> GetConPartidaImprAsync(List<CON_PARTIDA_IMPRView> data, string token);
	}
}
