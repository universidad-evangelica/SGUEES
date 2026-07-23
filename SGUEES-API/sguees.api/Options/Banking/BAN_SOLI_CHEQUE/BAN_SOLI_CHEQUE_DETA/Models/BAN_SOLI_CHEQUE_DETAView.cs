namespace sguees.Models
{
	public class BAN_SOLI_CHEQUE_DETAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_DOCUMENTO_DETA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_CENTRO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
	}
}
