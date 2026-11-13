using System;

namespace sguees.Models
{
	public class COM_ORDEN_COMPRA_DETAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_ORDEN_COMPRA { get; set; }
		public int CORR_ORDEN_COMPRA_DETA { get; set; }
		public int? NUMERO_ORDEN_COMPRA { get; set; }
		public DateTime? FECHA_ORDEN_COMPRA { get; set; }
		public string CODIGO_ITEM { get; set; }
		public string NOMBRE_ITEM { get; set; }
		public int? CORR_UNIDAD_MEDIDA { get; set; }
		public string NOMBRE_UNIDAD_MEDIDA { get; set; }
		public decimal CANTIDAD { get; set; }
		public decimal PRECIO_UNITARIO { get; set; }
		public decimal MONTO_SUBTOTAL { get; set; }
		public int? ANIO_PERIODO_COTIZACION { get; set; }
		public int? CORR_COTIZACION { get; set; }
		public int? CORR_COTIZACION_DETA { get; set; }
		public int? CORR_CENTRO_COSTO { get; set; }
		public decimal? CANTIDAD_RECIBIDA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
