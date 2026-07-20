using System;
using System.Collections.Generic;
using sguees.Models;

namespace sguees.Repositories
{
	internal static class BanReportImprFactory
	{
		internal static object ToImprViews(string codigo, List<Dictionary<string, object>> rows)
		{
			switch (codigo?.Trim().ToUpperInvariant())
			{
				case "BAN_CHEQUE_EMITIDOS":
					return ReportImprMapper.ToImprViews<BAN_CHEQUE_EMITIDOS_IMPRView>(rows);
				case "BAN_ESTADO_CUENTA":
					return ReportImprMapper.ToImprViews<BAN_ESTADO_CUENTA_IMPRView>(rows);
				case "BAN_ESTADO_CUENTA_ACUMULADO":
					return ReportImprMapper.ToImprViews<BAN_ESTADO_CUENTA_ACUMULADO_IMPRView>(rows);
				case "BAN_ENTREGA_CHEQUES":
					return ReportImprMapper.ToImprViews<BAN_ENTREGA_CHEQUES_IMPRView>(rows);
				default:
					throw new NotSupportedException($"Reporte bancario sin modelo IMPRView: {codigo}");
			}
		}
	}
}
