using eFramework.Data;

namespace sguees.Models
{
	public class CON_SECCIONTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DIVISION { get; set; }
		public int CORR_GERENCIA { get; set; }
		public int CORR_DEPARTAMENTO { get; set; }
		public int CORR_SECCION { get; set; }
		public string NOMBRE_SECCION { get; set; } = "";
		public string CODIGO_SECCION { get; set; } = "";
	}
}
