using System;

namespace sguees.Models
{
	public class BAN_ESTADO_CUENTA_IMPRView
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
		public string NUMERO_CUENTA_BANCO { get; set; }
		public DateTime? FECHA_MOVIMIENTO { get; set; }
		public int? CORR_TIPO_MOVIMIENTO { get; set; }
		public string CLASE_MOVIMIENTO { get; set; }
		public string REFERENCIA { get; set; }
		public decimal SALDO_INICIAL { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public decimal SALDO_ACTUAL { get; set; }
		public int? NUMERO_DOCUMENTO { get; set; }
	}
}
