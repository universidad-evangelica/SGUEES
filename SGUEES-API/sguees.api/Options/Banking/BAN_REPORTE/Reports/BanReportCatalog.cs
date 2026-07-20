using System.Collections.Generic;

namespace sguees.Repositories
{
	internal static class BanReportCatalog
	{
		internal static IEnumerable<BanReportEntry> All()
		{
			yield return ChequeEmitidosReportDefinition.Entry;
			yield return EstadoCuentaReportDefinition.Entry;
			yield return EstadoCuentaAcumuladoReportDefinition.Entry;
			yield return EntregaChequesReportDefinition.Entry;
		}
	}
}
