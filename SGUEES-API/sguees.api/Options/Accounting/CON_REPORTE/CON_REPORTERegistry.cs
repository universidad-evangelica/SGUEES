using System.Collections.Generic;

using sguees.Models;



namespace sguees.Repositories

{

	internal static class CON_REPORTERegistry

	{

		private static readonly Dictionary<string, ConReportEntry> _items = BuildItems();

		private static readonly Dictionary<string, string> _crystalDetailTables = BuildCrystalTables();

		private static readonly Dictionary<string, string> _rptEndpoints = BuildRptEndpoints();

		private static Dictionary<string, ConReportEntry> BuildItems()
		{
			var items = new Dictionary<string, ConReportEntry>();
			foreach (var entry in ConReportCatalog.All())
			{
				items[entry.Codigo] = entry;
			}

			return items;
		}

		private static Dictionary<string, string> BuildCrystalTables()
		{
			var tables = new Dictionary<string, string>();
			foreach (var entry in ConReportCatalog.All())
			{
				tables[entry.Codigo] = entry.CrystalDetailTable;
			}

			return tables;
		}

		private static Dictionary<string, string> BuildRptEndpoints()
		{
			var endpoints = new Dictionary<string, string>();
			foreach (var entry in ConReportCatalog.All())
			{
				endpoints[entry.Codigo] = entry.RptEndpoint;
			}

			return endpoints;
		}

		public static string GetCrystalDetailTable(string codigo, string storedProcedure)
		{
			if (!string.IsNullOrWhiteSpace(codigo)
				&& _crystalDetailTables.TryGetValue(codigo.Trim().ToUpperInvariant(), out var crystalTable))
			{
				return crystalTable;
			}

			return storedProcedure;
		}

		public static bool TryGetRptEndpoint(string codigo, out string endpoint)
		{
			endpoint = null;
			if (string.IsNullOrWhiteSpace(codigo))
			{
				return false;
			}

			return _rptEndpoints.TryGetValue(codigo.Trim().ToUpperInvariant(), out endpoint);
		}



		public static bool TryGet(string codigo, out (string Sp, string Titulo, string Destino, int Oleada, bool SpDisponible, string RptFile, string UrlOpcion, string[] Filtros) item)

		{

			if (string.IsNullOrWhiteSpace(codigo))

			{

				item = default;

				return false;

			}

			if (!_items.TryGetValue(codigo.Trim().ToUpperInvariant(), out var entry))
			{
				item = default;
				return false;
			}

			item = (entry.Sp, entry.Titulo, entry.Destino, entry.Oleada, entry.SpDisponible, entry.RptFile, entry.UrlOpcion, entry.Filtros);
			return true;

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

			foreach (var entry in _items.Values)

			{

				list.Add(new CON_REPORTEDefinitionView

				{

					CODIGO_REPORTE = entry.Codigo,

					TITULO = entry.Titulo,

					STORED_PROCEDURE = entry.Sp,

					DESTINO = entry.Destino,

					OLEADA = entry.Oleada,

					SP_DISPONIBLE = entry.SpDisponible,

					RPT_FILE = entry.RptFile,

					RPT_DISPONIBLE = entry.SpDisponible && !string.IsNullOrWhiteSpace(entry.RptFile),

					CONSULTA_GRID = entry.Destino == "B" && entry.SpDisponible,

					URL_OPCION = entry.UrlOpcion,

					URL_REPORTE = entry.UrlOpcion,

					URL_CONSULTA = entry.UrlOpcion,

					FILTROS = new List<string>(entry.Filtros),

				});

			}

			return list;

		}

	}

}


