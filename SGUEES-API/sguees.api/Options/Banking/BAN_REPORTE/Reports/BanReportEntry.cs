namespace sguees.Repositories
{
	internal readonly struct BanReportEntry
	{
		public BanReportEntry(
			string codigo,
			string sp,
			string titulo,
			string destino,
			int oleada,
			bool spDisponible,
			string rptFile,
			string rptEndpoint,
			string urlOpcion,
			string[] filtros)
		{
			Codigo = codigo;
			Sp = sp;
			Titulo = titulo;
			Destino = destino;
			Oleada = oleada;
			SpDisponible = spDisponible;
			RptFile = rptFile;
			RptEndpoint = rptEndpoint;
			UrlOpcion = urlOpcion;
			Filtros = filtros;
		}

		public string Codigo { get; }
		public string Sp { get; }
		public string Titulo { get; }
		public string Destino { get; }
		public int Oleada { get; }
		public bool SpDisponible { get; }
		public string RptFile { get; }
		public string RptEndpoint { get; }
		public string UrlOpcion { get; }
		public string[] Filtros { get; }
	}
}
