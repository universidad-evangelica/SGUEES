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
	}
}
