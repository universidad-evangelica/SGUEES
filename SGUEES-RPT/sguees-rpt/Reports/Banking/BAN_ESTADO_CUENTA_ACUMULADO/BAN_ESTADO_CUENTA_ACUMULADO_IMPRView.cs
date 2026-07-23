using System;

namespace sgueesRpt.Reports.Banking.BAN_ESTADO_CUENTA_ACUMULADO
{
	public class BAN_ESTADO_CUENTA_ACUMULADO_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }

		public int CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_BANCO { get; set; }
		public string NUMERO_CUENTA_BANCO { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public string NOMBRE_CUENTA_BANCO { get; set; }
		public decimal SALDO_INICIAL { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public decimal SALDO_ACTUAL { get; set; }
	}
}
