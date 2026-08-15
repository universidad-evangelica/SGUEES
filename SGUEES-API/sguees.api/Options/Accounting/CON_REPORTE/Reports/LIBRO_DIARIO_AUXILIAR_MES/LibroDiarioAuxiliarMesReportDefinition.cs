namespace sguees.Repositories
{
	internal static class LibroDiarioAuxiliarMesReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"LIBRO_DIARIO_AUXILIAR_MES",
			"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			"Libro Diario Auxiliar - Saldo Mes",
			"B",
			1,
			true,
			"LIBRO_DIARIO_AUXILIAR_MES",
			"PostConLibroDiarioAuxiliarMesImpr",
			"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			"/con-reporte-libro-diario-auxiliar-mes",
			new[]
			{
				"FECHA_INICIAL", "FECHA_FINAL", "CUENTA_CONTABLE_INICIAL", "CUENTA_CONTABLE_FINAL",
				"PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "CONSOLIDADO", "FOLIADO", "NUMERO_FOLIO",
			});
	}
}
