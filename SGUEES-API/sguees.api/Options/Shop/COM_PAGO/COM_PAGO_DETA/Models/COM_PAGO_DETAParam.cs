using eFramework.Data;

namespace sguees.Models
{
	public class COM_PAGO_DETAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PAGO { get; set; }
		public int CORR_DETA { get; set; }
		public int TIPO_CONSULTA { get; set; } = 1;
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
