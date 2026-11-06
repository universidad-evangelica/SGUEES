using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PROVEEDORParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public long CORR_PERSONA { get; set; }
		public int PAGE { get; set; } = 1;
		public int PAGE_SIZE { get; set; } = 50;
		public string SORT_FIELD { get; set; }
		public bool SORT_DESC { get; set; }
	}
}
