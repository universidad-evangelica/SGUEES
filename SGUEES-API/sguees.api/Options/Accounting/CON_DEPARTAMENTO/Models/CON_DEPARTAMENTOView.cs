using eFramework.Data;

namespace sguees.Models
{
	public class CON_DEPARTAMENTOView : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DIVISION { get; set; }
		public int CORR_GERENCIA { get; set; }
		public int CORR_DEPARTAMENTO { get; set; }
		public string NOMBRE_DEPARTAMENTO { get; set; } = "";
		public string CODIGO_DEPARTAMENTO { get; set; } = "";
	}
}
