using System;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_ORDEN_COMPRAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int NUMERO_ORDEN { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public decimal MONTO_TOTAL_ORDEN { get; set; }
		public string NOMBRE_CONTACTO { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public string NOMBRE_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string NOMBRE_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
		public string ESTADO_ORDEN_COMPRA { get; set; }
        public string NOMBRE_ESTADO_ORDEN_COMPRA { get; set; }
	}
}
