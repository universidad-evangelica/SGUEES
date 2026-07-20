namespace sguees.Repositories
{
	internal static class EstadoResultadosReportDefinition
	{
		internal static ConReportEntry Entry { get; } = new(
			"ESTADO_RESULTADOS",
			"PRAL_IMPR_ESTADO_RESULTADOS",
			"Estado de Resultados",
			"B",
			1,
			true,
			"ESTADO_RESULTADOS",
			"PostConEstadoResultadosImpr",
			"PRAL_IMPR_ESTADO_RESULTADOS",
			"/con-reporte-estado-resultados",
			new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "FOLIADO", "NUMERO_FOLIO" });
	}
}
