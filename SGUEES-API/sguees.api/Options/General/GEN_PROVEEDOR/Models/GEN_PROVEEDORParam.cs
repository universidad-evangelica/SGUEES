using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PROVEEDORParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public long CORR_PERSONA { get; set; }
		public int PAGE { get; set; } = 1;
		/// <summary>Tamaño de página. 0 = Todos (sin OFFSET/FETCH).</summary>
		public int PAGE_SIZE { get; set; } = 15;
		public string SORT_FIELD { get; set; }
		public bool SORT_DESC { get; set; }
		/// <summary>Filtros filter-row (LIKE). Vacío = sin filtro en esa columna.</summary>
		public string CODIGO_PROVEEDOR { get; set; }
		public string NOMBRE_COMERCIAL { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public string NOMBRE_TIPO_PERSONERIA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		/// <summary>null = todos; true/false = Activo/Inactivo (filter-row Estado).</summary>
		public bool? ACTIVO_PROVEEDOR { get; set; }
		/// <summary>Búsqueda libre opcional (OR en código/nombres). Preferir filtros por columna.</summary>
		public string SEARCH { get; set; }
	}
}
