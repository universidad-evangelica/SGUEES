using eFramework.Data;

namespace sguees.Models
{
	public class COM_PROVISION_CONTAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PROVISION { get; set; }
		public int CORR_DETA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
