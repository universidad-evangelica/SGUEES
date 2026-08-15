namespace sguees.Repositories
{
	internal static class BalanceGeneralReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"BALANCE_GENERAL",
			"PRAL_IMPR_BALANCE_GENERAL",
			"Balance General",
			"B",
			1,
			true,
			"BALANCE_GENERAL",
			"PostConBalanceGeneralImpr",
			"PRAL_IMPR_BALANCE_GENERAL",
			"/con-reporte-balance-general",
			new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "FOLIADO", "NUMERO_FOLIO" });
	}
}
