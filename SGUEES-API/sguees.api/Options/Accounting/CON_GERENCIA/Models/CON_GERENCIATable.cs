using eFramework.Data;

namespace sguees.Models
{
	public class CON_GERENCIATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DIVISION { get; set; }
		public int CORR_GERENCIA { get; set; }
		public string NOMBRE_GERENCIA { get; set; } = "";
		public string CODIGO_GERENCIA { get; set; } = "";
	}
}
