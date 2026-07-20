namespace sguees.Repositories
{
	internal static class BalanceComprobacionReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"BALANCE_COMPROBACION",
			"PRAL_IMPR_BALANCE_COMPROBACION",
			"Balance de Comprobacion",
			"B",
			1,
			true,
			"BALANCE_COMPROBACION",
			"PostConBalanceComprobacionImpr",
			"PRAL_IMPR_BALANCE_COMPROBACION",
			"/con-reporte-balance-comprobacion",
			new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "FOLIADO", "NUMERO_FOLIO" });
	}
}
