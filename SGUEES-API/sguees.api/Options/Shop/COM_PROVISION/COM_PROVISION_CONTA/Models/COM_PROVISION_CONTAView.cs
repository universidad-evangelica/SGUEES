namespace sguees.Models
{
	public class COM_PROVISION_CONTAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PROVISION { get; set; }
		public int CORR_DETA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public int CORR_AUXILIAR { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public string CORR_AUXILIAR_UNICO { get; set; }
		public string NOMBRE_AUXILIAR { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public string NOMBRE_CENTRO { get; set; }
	}
}
