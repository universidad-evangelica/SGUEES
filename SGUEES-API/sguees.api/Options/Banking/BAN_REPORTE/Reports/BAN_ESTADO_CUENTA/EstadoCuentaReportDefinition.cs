namespace sguees.Repositories
{
	internal static class EstadoCuentaReportDefinition
	{
		internal static BanReportEntry Entry { get; } = new(
			"BAN_ESTADO_CUENTA",
			"PRAL_IMPR_BAN_ESTADO_CUENTA",
			"Disponibilidad Bancaria Auxiliar",
			"B",
			1,
			true,
			"BAN_ESTADO_CUENTA",
			"PostBanEstadoCuentaImpr",
			"/ban-reporte-estado-cuenta",
			new[] { "FECHA_INICIAL", "FECHA_FINAL", "CORR_CUENTA_BANCO", "CORR_TIPO_MOVIMIENTO" });
	}
}
