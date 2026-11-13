using System;

namespace sguees.Models
{
	public class COM_PAGO_A_PAGAR_ARCHIVOView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PAGO { get; set; }
		public int NUMERO_PAGO { get; set; }
		public DateTime FECHA_PAGO { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public decimal MONTO_PAGO { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public int? CORR_ARCHIVO { get; set; }
		public bool SELECCION { get; set; }
		public decimal MONTO_ARCHIVO { get; set; }
	}
}
