using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_BANDEJA_ACTORES_BITACORAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; } = 101;
	}
}
