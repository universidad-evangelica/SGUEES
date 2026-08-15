using System.Collections.Generic;

namespace sguees.Repositories
{
	/// <summary>Agregador de definiciones — una clase por reporte en subcarpeta Reports/{CODIGO}/.</summary>
	internal static class ConReportCatalog
	{
		internal static IEnumerable<ConReportEntry> All()
		{
			yield return LibroDiarioAuxiliarReportDefinition.Entry;
			yield return LibroDiarioAuxiliarMesReportDefinition.Entry;
			yield return LibroDiarioMayorReportDefinition.Entry;
			yield return BalanceComprobacionReportDefinition.Entry;
			yield return BalanceComprobacionMesReportDefinition.Entry;
			yield return BalanceGeneralReportDefinition.Entry;
			yield return EstadoResultadosReportDefinition.Entry;
			yield return BalanceGeneralVerticalReportDefinition.Entry;
		}
	}
}
