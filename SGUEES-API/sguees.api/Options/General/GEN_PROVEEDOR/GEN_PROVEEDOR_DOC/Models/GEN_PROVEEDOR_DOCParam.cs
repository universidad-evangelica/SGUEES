using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PROVEEDOR_DOCParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
