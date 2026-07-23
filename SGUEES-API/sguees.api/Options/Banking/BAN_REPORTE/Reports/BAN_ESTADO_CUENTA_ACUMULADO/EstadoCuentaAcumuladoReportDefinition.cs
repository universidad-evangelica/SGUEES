namespace sguees.Repositories
{
	internal static class EstadoCuentaAcumuladoReportDefinition
	{
		internal static BanReportEntry Entry { get; } = new(
			"BAN_ESTADO_CUENTA_ACUMULADO",
			"PRAL_IMPR_BAN_ESTADO_CUENTA_ACUMULADO",
			"Disponibilidad Bancaria",
			"B",
			1,
			true,
			"BAN_ESTADO_CUENTA_ACUMULADO",
			"PostBanEstadoCuentaAcumuladoImpr",
			"/ban-reporte-estado-cuenta-acumulado",
			new[] { "FECHA_INICIAL", "FECHA_FINAL", "CORR_CUENTA_BANCO", "CORR_TIPO_MOVIMIENTO" });
	}
}
