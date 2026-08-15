using eFramework.Data;

namespace sguees.Models
{
	public class BAN_SOLI_CHEQUE_DETAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_DOCUMENTO_DETA { get; set; }
	}
}
