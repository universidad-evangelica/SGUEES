namespace sguees.Repositories
{
	internal static class EntregaChequesReportDefinition
	{
		internal static BanReportEntry Entry { get; } = new(
			"BAN_ENTREGA_CHEQUES",
			"PRAL_IMPR_BAN_ENTREGA_CHEQUES",
			"Reporte de Cheques Entregados",
			"B",
			1,
			true,
			"BAN_ENTREGA_CHEQUES",
			"PostBanEntregaChequesImpr",
			"/ban-reporte-entrega-cheques",
			new[] { "FECHA_INICIAL", "FECHA_FINAL" });
	}
}
