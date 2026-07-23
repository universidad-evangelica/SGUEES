namespace sguees.Repositories
{
	internal static class LibroDiarioMayorReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"LIBRO_DIARIO_MAYOR",
			"PRAL_IMPR_LIBRO_DIARIO_MAYOR",
			"Libro Diario Mayor",
			"B",
			1,
			true,
			"LIBRO_DIARIO_MAYOR",
			"PostConLibroDiarioMayorImpr",
			"PRAL_IMPR_LIBRO_DIARIO_MAYOR",
			"/con-reporte-libro-diario-mayor",
			new[]
			{
				"FECHA_INICIAL", "FECHA_FINAL", "CUENTA_CONTABLE_INICIAL", "CUENTA_CONTABLE_FINAL",
				"PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "FOLIADO", "NUMERO_FOLIO",
			});
	}
}
