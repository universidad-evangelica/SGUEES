using System.Collections.Generic;



namespace sgueesRpt.Reports.Accounting

{

	/// <summary>

	/// Catalogo de archivos .rpt copiados desde e-Admin (oleada 1 prioritarios).

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



		internal static bool TryGetRpt(string codigoReporte, out string rptName)

		{

			if (string.IsNullOrWhiteSpace(codigoReporte))

			{

				rptName = null;

				return false;

			}



			return CodigoToRpt.TryGetValue(codigoReporte.Trim().ToUpperInvariant(), out rptName);

		}

	}

}


