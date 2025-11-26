using System;

namespace scuees.Models
{
	public class COM_CUADRO_COMPARATIVO_COTIZACION_DETAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public Int64 CORR_DETA { get; set; }
		public int ANIO_PERIODO_COTIZACION { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COTIZACION_DETA { get; set; }
		public string CODIGO_ITEM { get; set; }
		public string NOMBRE_ITEM { get; set; }
		public string NOMBRE_UNIDAD_MEDIDA { get; set; }
		public decimal CANTIDAD { get; set; }
		public decimal PRECIO_UNITARIO { get; set; }
		public decimal MONTO_SUBTOTAL { get; set; }
		public string MARCA { get; set; }
		public bool SELECCION { get; set; }
		public string OBSERVACIONES { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
	}
}
