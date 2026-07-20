namespace sguees.Repositories
{
	internal static class BalanceGeneralVerticalReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"BALANCE_GENERAL_VERTICAL",
			"PRAL_IMPR_BALANCE_GENERAL_VERTICAL",
			"Balance General Vertical",
			"B",
			1,
			true,
			"BALANCE_GENERAL_VERTICAL",
			"PostConBalanceGeneralVerticalImpr",
			"PRAL_IMPR_ESTADO_RESULTADOS",
			"/con-reporte-balance-general-vertical",
			new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "FOLIADO", "NUMERO_FOLIO" });
	}
}
