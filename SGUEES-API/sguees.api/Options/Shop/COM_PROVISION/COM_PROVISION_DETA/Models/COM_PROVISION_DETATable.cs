using eFramework.Data;

namespace sguees.Models
{
	public class COM_PROVISION_DETATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PROVISION { get; set; }
		public int CORR_DETA { get; set; }
		public int ANIO_PERIODO_COM { get; set; }
		public int MES_PERIODO_COM { get; set; }
		public int CORR_DOCUMENTO_COM { get; set; }
		public decimal MONTO_DOCUMENTO { get; set; }
		public decimal MONTO_INICIAL { get; set; }
		public decimal MONTO_PAGO { get; set; }
		public decimal MONTO_FINAL { get; set; }
		public bool NO_CONTABILIZAR { get; set; }
	}
}
