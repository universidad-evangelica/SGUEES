using System;
using System.Collections.Generic;
using sguees.Models;

namespace sguees.Repositories
{
	internal static class ConReportImprFactory
	{
		internal static object ToImprViews(string codigo, List<Dictionary<string, object>> rows)
		{
			switch (codigo?.Trim().ToUpperInvariant())
			{
				case "LIBRO_DIARIO_AUXILIAR":
					return ReportImprMapper.ToImprViews<LIBRO_DIARIO_AUXILIAR_IMPRView>(rows);
				case "LIBRO_DIARIO_AUXILIAR_MES":
					return ReportImprMapper.ToImprViews<LIBRO_DIARIO_AUXILIAR_MES_IMPRView>(rows);
				case "LIBRO_DIARIO_MAYOR":
					return ReportImprMapper.ToImprViews<LIBRO_DIARIO_MAYOR_IMPRView>(rows);
				case "BALANCE_COMPROBACION":
					return ReportImprMapper.ToImprViews<BALANCE_COMPROBACION_IMPRView>(rows);
				case "BALANCE_COMPROBACION_MES":
					return ReportImprMapper.ToImprViews<BALANCE_COMPROBACION_MES_IMPRView>(rows);
				case "BALANCE_GENERAL":
					return ReportImprMapper.ToImprViews<BALANCE_GENERAL_IMPRView>(rows);
				case "ESTADO_RESULTADOS":
					return ReportImprMapper.ToImprViews<ESTADO_RESULTADOS_IMPRView>(rows);
				case "BALANCE_GENERAL_VERTICAL":
					return ReportImprMapper.ToImprViews<BALANCE_GENERAL_VERTICAL_IMPRView>(rows);
				default:
					throw new NotSupportedException($"Reporte contable sin modelo IMPRView: {codigo}");
			}
		}
	}
}
