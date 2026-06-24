using eFramework.Data;

namespace sguees.Models
{
	public class CON_CATALOGO_PRESUPUESTOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public int ANIO_PERIODO { get; set; }
	}
}
