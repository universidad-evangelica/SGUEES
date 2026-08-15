namespace sguees.Repositories
{
	internal static class LibroDiarioAuxiliarReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"LIBRO_DIARIO_AUXILIAR",
			"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			"Libro Diario Auxiliar",
			"B",
			1,
			true,
			"LIBRO_DIARIO_AUXILIAR",
			"PostConLibroDiarioAuxiliarImpr",
			"PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			"/con-reporte-libro-diario-auxiliar",
			new[]
			{
				"FECHA_INICIAL", "FECHA_FINAL", "CUENTA_CONTABLE_INICIAL", "CUENTA_CONTABLE_FINAL",
				"PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "CONSOLIDADO", "FOLIADO", "NUMERO_FOLIO",
			});
	}
}
