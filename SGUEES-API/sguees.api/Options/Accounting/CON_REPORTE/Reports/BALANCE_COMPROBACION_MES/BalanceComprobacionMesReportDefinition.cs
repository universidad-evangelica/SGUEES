namespace sguees.Repositories
{
	internal static class BalanceComprobacionMesReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"BALANCE_COMPROBACION_MES",
			"PRAL_IMPR_BALANCE_COMPROBACION",
			"Balance de Comprobacion - Saldo Mes",
			"B",
			1,
			true,
			"BALANCE_COMPROBACION_MES",
			"PostConBalanceComprobacionMesImpr",
			"PRAL_IMPR_BALANCE_COMPROBACION",
			"/con-reporte-balance-comprobacion-mes",
			new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "FOLIADO", "NUMERO_FOLIO" });
	}
}
