using System;

namespace sguees.Models
{
	public class COM_ORDEN_COMPRA_DETAView
	{
		public int CORR_EMPRESA { get; set; }
        public int ANIO_PERIODO { get; set; }
        public int CORR_CUADRO_COMPARATIVO { get; set; }
        public string NUMERO_ORDEN_COMPRA { get; set; }
        public DateTime FECHA_ORDEN_COMPRA { get; set; }
        public decimal CANTIDAD { get; set; }
        public string NOMBRE_UNIDAD_MEDIDA { get; set; }
        public string NOMBRE_ITEM { get; set; }
        public string CODIGO_ITEM { get; set; }
        public decimal PRECIO_UNITARIO { get; set; }
        public decimal MONTO_SUBTOTAL {get; set; }
	}
}
