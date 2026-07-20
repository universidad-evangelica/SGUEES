namespace sguees.Repositories
{
	internal static class ChequeEmitidosReportDefinition
	{
		internal static BanReportEntry Entry { get; } = new(
			"BAN_CHEQUE_EMITIDOS",
			"PRAL_IMPR_BAN_CHEQUE_EMITIDOS",
			"Reporte de Cheques Emitidos",
			"B",
			1,
			true,
			"BAN_CHEQUE_EMITIDOS",
			"PostBanChequeEmitidosImpr",
			"/ban-reporte-cheque-emitidos",
			new[] { "FECHA_INICIAL", "FECHA_FINAL", "CORR_CUENTA_BANCO", "NUMERO_DOCUMENTO_INICIAL", "NUMERO_DOCUMENTO_FINAL" });
	}
}
