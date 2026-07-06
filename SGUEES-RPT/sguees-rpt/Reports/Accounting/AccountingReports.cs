using System;
using System.Collections.Generic;

namespace sgueesRpt.Reports.Accounting
{
	internal sealed class ConEmbeddedReportInfo
	{
		public string ResourceName { get; set; }
		public string FullResourceName { get; set; }
		public string DetailTableName { get; set; }
	}

	/// <summary>
	/// Catalogo de archivos .rpt contables embebidos (oleada 1 + reportes e-Admin en carpeta Accounting).
	/// </summary>
	internal static class AccountingReports
	{
		internal static readonly Dictionary<string, string> CodigoToRpt = new Dictionary<string, string>
		{
			["LIBRO_DIARIO_AUXILIAR"] = "LIBRO_DIARIO_AUXILIAR",
			["LIBRO_DIARIO_AUXILIAR_MES"] = "LIBRO_DIARIO_AUXILIAR_MES",
			["LIBRO_DIARIO_MAYOR"] = "LIBRO_DIARIO_MAYOR",
			["BALANCE_COMPROBACION"] = "BALANCE_COMPROBACION",
			["BALANCE_COMPROBACION_MES"] = "BALANCE_COMPROBACION_MES",
			["BALANCE_GENERAL"] = "BALANCE_GENERAL",
			["ESTADO_RESULTADOS"] = "ESTADO_RESULTADOS",
			["BALANCE_GENERAL_VERTICAL"] = "BALANCE_GENERAL_VERTICAL",
			["CON_PARTIDA"] = "PARTIDA_CONTABLE",
		};

		private static readonly Dictionary<string, string> RptToDetailTable = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
		{
			["LIBRO_DIARIO_AUXILIAR"] = "PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			["LIBRO_DIARIO_AUXILIAR_MES"] = "PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			["LIBRO_DIARIO_AUXILIAR_HORIZONTAL"] = "PRAL_IMPR_LIBRO_DIARIO_AUXILIAR",
			["LIBRO_DIARIO_MAYOR"] = "PRAL_IMPR_LIBRO_DIARIO_MAYOR",
			["LIBRO_DIARIO_MAYOR_H"] = "PRAL_IMPR_LIBRO_DIARIO_MAYOR",
			["BALANCE_COMPROBACION"] = "PRAL_IMPR_BALANCE_COMPROBACION",
			["BALANCE_COMPROBACION_MES"] = "PRAL_IMPR_BALANCE_COMPROBACION",
			["BALANCE_GENERAL"] = "PRAL_IMPR_BALANCE_GENERAL",
			["ESTADO_RESULTADOS"] = "PRAL_IMPR_ESTADO_RESULTADOS",
			["BALANCE_GENERAL_VERTICAL"] = "PRAL_IMPR_ESTADO_RESULTADOS",
			["LIBRO_INTEGRACION_CONTABLE"] = "PRAL_IMPR_LIBRO_INTEGRACION_CONTABLE",
			["LIBRO_INTEGRACION_CONTABLE_CC"] = "PRAL_IMPR_LIBRO_INTEGRACION_CONTABLE_CC",
			["CON_REPORTE_GASTOS"] = "V_CON_REPORTE_GASTOS",
			["CON_REPORTE_GASTOS_PRESUPUESTO"] = "PRAL_IMPR_CON_GASTOS_PRESUPUESTO",
			["CON_LIBRO_DIARIO"] = "V_CON_PARTIDA_IMPR",
			["CON_LIBRO_INVENTARIO"] = "CON_LIBRO_INVENTRARIO",
			["CON_REPORTE_CATALOGO_PRESUPUESTO"] = "V_CON_REPORTE_CATALOGO_PRESUPUESTO",
			["R_CON_BALANCE_SALDOS_AUXI"] = "CON_BALANCE_SALDOS_AUXI",
			["R_CON_LIBRO_MAYOR"] = "V_CON_LIBRO_MAYOR_REPO",
			["R_CON_BALANCE_GENERAL_PORCENTAJE"] = "V_CON_BALANCE_GENERAL_PORCENTAJE_IMPRIME",
			["R_CON_BALANCE_GENERAL_PORCENTAJE_AC"] = "V_CON_BALANCE_GENERAL_PORCENTAJE_AC_IMPRIME",
			["R_CON_BALANCE_GENERAL_PORCENTAJE_PA_CP"] = "V_CON_BALANCE_GENERAL_PORCENTAJE_PA_CP_IMPRIME",
			["R_CON_IMPUESTO_F14"] = "PRAL_IMPR_CON_IMPUESTO_F14",
		};

		private static readonly Dictionary<string, ConEmbeddedReportInfo> RptToEmbedded = BuildEmbeddedCatalog();

		private static Dictionary<string, ConEmbeddedReportInfo> BuildEmbeddedCatalog()
		{
			var catalog = new Dictionary<string, ConEmbeddedReportInfo>(StringComparer.OrdinalIgnoreCase);
			foreach (var entry in RptToDetailTable)
			{
				catalog[entry.Key] = CreateEmbeddedInfo(entry.Key, entry.Value);
			}

			return catalog;
		}

		private static ConEmbeddedReportInfo CreateEmbeddedInfo(string rptKey, string detailTable)
		{
			return new ConEmbeddedReportInfo
			{
				ResourceName = rptKey + "Report.rpt",
				FullResourceName = "sgueesRpt.Reports.Accounting.Embedded." + rptKey + "." + rptKey + "Report.rpt",
				DetailTableName = detailTable,
			};
		}

		internal static bool TryGetRpt(string codigoReporte, out string rptName)
		{
			if (string.IsNullOrWhiteSpace(codigoReporte))
			{
				rptName = null;
				return false;
			}

			return CodigoToRpt.TryGetValue(codigoReporte.Trim().ToUpperInvariant(), out rptName);
		}

		internal static bool TryGetDetailTable(string codigoReporte, out string detailTableName)
		{
			detailTableName = null;
			if (string.IsNullOrWhiteSpace(codigoReporte))
			{
				return false;
			}

			var key = codigoReporte.Trim();
			if (RptToDetailTable.TryGetValue(key, out detailTableName))
			{
				return true;
			}

			if (CodigoToRpt.TryGetValue(key.ToUpperInvariant(), out var rptName)
				&& RptToDetailTable.TryGetValue(rptName, out detailTableName))
			{
				return true;
			}

			foreach (var entry in RptToDetailTable)
			{
				if (CodigoToRpt.TryGetValue(entry.Key, out var mappedRpt)
					&& string.Equals(mappedRpt, key, StringComparison.OrdinalIgnoreCase))
				{
					detailTableName = entry.Value;
					return true;
				}
			}

			return false;
		}

		internal static bool TryGetEmbeddedReport(string rptFileName, out ConEmbeddedReportInfo info)
		{
			info = null;
			if (string.IsNullOrWhiteSpace(rptFileName))
			{
				return false;
			}

			var key = rptFileName.Trim();
			if (key.EndsWith(".rpt", StringComparison.OrdinalIgnoreCase))
			{
				key = key.Substring(0, key.Length - 4);
			}

			return RptToEmbedded.TryGetValue(key, out info);
		}
	}
}
