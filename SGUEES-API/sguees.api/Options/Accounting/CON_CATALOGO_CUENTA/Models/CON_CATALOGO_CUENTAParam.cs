using eFramework.Data;

namespace sguees.Models
{
	public class CON_CATALOGO_CUENTAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string CODIGO_RUBRO { get; set; }
	}
}
