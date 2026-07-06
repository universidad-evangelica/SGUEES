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

		Task<Stream> GetConReporteImprAsync(List<CON_REPORTE_IMPRView> data, string rptEndpoint, string token);

		Task<Stream> GetConPartidaImprAsync(List<CON_PARTIDA_IMPRView> data, string token);

	}

}

