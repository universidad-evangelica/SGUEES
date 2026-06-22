using System.Collections.Generic;

using sguees.Models;



namespace sguees.Repositories

{

	internal static class CON_REPORTERegistry

	{

		private static readonly Dictionary<string, (string Sp, string Titulo, string Destino, int Oleada, bool SpDisponible, string RptFile, string UrlOpcion, string[] Filtros)> _items =

			new()

			{

				["LIBRO_DIARIO_AUXILIAR"] = ("PRAL_IMPR_LIBRO_DIARIO_AUXILIAR", "Libro Diario Auxiliar", "B", 1, true, "LIBRO_DIARIO_AUXILIAR", "/con-reporte-libro-diario-auxiliar",

					new[] { "FECHA_INICIAL", "FECHA_FINAL", "CUENTA_CONTABLE_INICIAL", "CUENTA_CONTABLE_FINAL", "CORR_CONFI_REPORTE", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "CONSOLIDADO", "CORR_MONEDA", "FOLIADO", "NUMERO_FOLIO" }),

				["LIBRO_DIARIO_AUXILIAR_MES"] = ("PRAL_IMPR_LIBRO_DIARIO_AUXILIAR", "Libro Diario Auxiliar - Saldo Mes", "B", 1, true, "LIBRO_DIARIO_AUXILIAR_MES", "/con-reporte-libro-diario-auxiliar-mes",

					new[] { "FECHA_INICIAL", "FECHA_FINAL", "CUENTA_CONTABLE_INICIAL", "CUENTA_CONTABLE_FINAL", "CORR_CONFI_REPORTE", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "CONSOLIDADO", "CORR_MONEDA", "FOLIADO", "NUMERO_FOLIO" }),

				["LIBRO_DIARIO_MAYOR"] = ("PRAL_IMPR_LIBRO_DIARIO_MAYOR", "Libro Diario Mayor", "B", 1, true, "LIBRO_DIARIO_MAYOR", "/con-reporte-libro-diario-mayor",

					new[] { "FECHA_INICIAL", "FECHA_FINAL", "CUENTA_CONTABLE_INICIAL", "CUENTA_CONTABLE_FINAL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CUENTA_A_CERO", "CORR_MONEDA", "FOLIADO", "NUMERO_FOLIO" }),

				["BALANCE_COMPROBACION"] = ("PRAL_IMPR_BALANCE_COMPROBACION", "Balance de Comprobacion", "B", 1, true, "BALANCE_COMPROBACION", "/con-reporte-balance-comprobacion",

					new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CORR_MONEDA", "CUENTA_A_CERO", "FOLIADO", "NUMERO_FOLIO" }),

				["BALANCE_COMPROBACION_MES"] = ("PRAL_IMPR_BALANCE_COMPROBACION", "Balance de Comprobacion - Saldo Mes", "B", 1, true, "BALANCE_COMPROBACION_MES", "/con-reporte-balance-comprobacion-mes",

					new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CORR_MONEDA", "CUENTA_A_CERO", "FOLIADO", "NUMERO_FOLIO" }),

				["BALANCE_GENERAL"] = ("PRAL_IMPR_BALANCE_GENERAL", "Balance General", "B", 1, true, "BALANCE_GENERAL", "/con-reporte-balance-general",

					new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CORR_MONEDA", "FOLIADO", "NUMERO_FOLIO" }),

				["ESTADO_RESULTADOS"] = ("PRAL_IMPR_ESTADO_RESULTADOS", "Estado de Resultados", "B", 1, true, "ESTADO_RESULTADOS", "/con-reporte-estado-resultados",

					new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CORR_MONEDA", "FOLIADO", "NUMERO_FOLIO" }),

				["BALANCE_GENERAL_VERTICAL"] = ("PRAL_IMPR_BALANCE_GENERAL_VERTICAL", "Balance General Vertical", "B", 1, true, "BALANCE_GENERAL_VERTICAL", "/con-reporte-balance-general-vertical",

					new[] { "FECHA_FINAL", "NIVEL", "PARTIDA_CIERRE", "PARTIDA_LIQUIDACION", "CORR_MONEDA", "FOLIADO", "NUMERO_FOLIO" }),

			};



		public static bool TryGet(string codigo, out (string Sp, string Titulo, string Destino, int Oleada, bool SpDisponible, string RptFile, string UrlOpcion, string[] Filtros) item)

		{

			if (string.IsNullOrWhiteSpace(codigo))

			{

				item = default;

				return false;

			}

			return _items.TryGetValue(codigo.Trim().ToUpperInvariant(), out item);

		}



		public static bool TryGetUrlOpcion(string codigo, out string urlOpcion)

		{

			if (TryGet(codigo, out var item))

			{

				urlOpcion = item.UrlOpcion;

				return !string.IsNullOrWhiteSpace(urlOpcion);

			}



			urlOpcion = null;

			return false;

		}



		public static List<CON_REPORTEDefinitionView> GetAll()

		{

			var list = new List<CON_REPORTEDefinitionView>();

			foreach (var entry in _items)

			{

				list.Add(new CON_REPORTEDefinitionView

				{

					CODIGO_REPORTE = entry.Key,

					TITULO = entry.Value.Titulo,

					STORED_PROCEDURE = entry.Value.Sp,

					DESTINO = entry.Value.Destino,

					OLEADA = entry.Value.Oleada,

					SP_DISPONIBLE = entry.Value.SpDisponible,

					RPT_FILE = entry.Value.RptFile,

					RPT_DISPONIBLE = entry.Value.SpDisponible && !string.IsNullOrWhiteSpace(entry.Value.RptFile),

					CONSULTA_GRID = entry.Value.Destino == "B" && entry.Value.SpDisponible,

					URL_OPCION = entry.Value.UrlOpcion,

					URL_REPORTE = entry.Value.UrlOpcion,

					URL_CONSULTA = entry.Value.UrlOpcion,

					FILTROS = new List<string>(entry.Value.Filtros),

				});

			}

			return list;

		}

	}

}


