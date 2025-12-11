using System;

namespace sguees.Models
{
	public class COM_COTIZACION_DETAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COTIZACION_DETA { get; set; }
		public string CODIGO_ITEM { get; set; }
		public string NOMBRE_ITEM { get; set; }
		public decimal CANTIDAD { get; set; }
		public int CORR_UNIDAD_MEDIDA { get; set; }
		public decimal PRECIO_UNITARIO { get; set; }
		public decimal MONTO_SUBTOTAL { get; set; }
		public string OBSERVACIONES { get; set; }
		public string MARCA { get; set; }
		public string ESTADO_SOLI_COTIZACION { get; set; }
		public string NOMBRE_ESTADO_SOLI_COTIZACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string IMAGEN_DOCUMENTO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
