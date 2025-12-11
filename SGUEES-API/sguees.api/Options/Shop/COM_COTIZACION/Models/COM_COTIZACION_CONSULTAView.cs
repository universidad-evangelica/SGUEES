using System;

namespace sguees.Models
{
	public class COM_COTIZACION_CONSULTAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public DateTime FECHA_SOLI_COTIZACION { get; set; }
		public DateTime FECHA_LIMITE_COTIZACION { get; set; }
		public string CODIGO_DEPTO { get; set; }
		public int ANIO_PERIODO_SOLI_COMPRA { get; set; }
		public int CORR_SOLI_COMPRA { get; set; }
		public string USUARIO_SOLI { get; set; }
		public string OBSERVACIONES_SOLI_COTIZA { get; set; }
		public string ESTADO_SOLI_COTIZACION { get; set; }
		public string NOMBRE_ESTADO_SOLI_COTIZACION { get; set; }
		public string NUMERO_SOLI_COMPRA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_COTIZACION { get; set; }
		public DateTime FECHA_COTIZACION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public string USUARIO_COTIZA { get; set; }
		public string OBSERVACIONES_COTIZA { get; set; }
		public string OBSERVACIONES_PROVEEDOR { get; set; }
		public string PLAZO_ENTREGA { get; set; }
		public string ESTADO_COTIZACION { get; set; }
		public string NOMBRE_ESTADO_COTIZACION { get; set; }
		public string USUARIO_CREA_COTIZA { get; set; }
		public DateTime FECHA_CREA_COTIZA { get; set; }
		public string ESTACION_CREA_COTIZA { get; set; }
		public string USUARIO_ACTU_COTIZA { get; set; }
		public DateTime FECHA_ACTU_COTIZA { get; set; }
		public string ESTACION_ACTU_COTIZA { get; set; }
		public int CORR_COTIZACION_DETA { get; set; }
		public string CODIGO_ITEM { get; set; }
		public string NOMBRE_ITEM { get; set; }
		public Decimal CANTIDAD { get; set; }
		public int CORR_UNIDAD_MEDIDA { get; set; }
		public string NOMBRE_UNIDAD_MEDIDA { get; set; }
		public decimal PRECIO_UNITARIO { get; set; }
		public decimal MONTO_SUBTOTAL { get; set; }
		public string OBSERVACIONES { get; set; }
		public string MARCA { get; set; }
		public string ESTADO_COTIZACION_DETA { get; set; }
		public string NOMBRE_ESTADO_COTIZACION_DETA { get; set; }
		public string USUARIO_CREA_COTIZA_DETA { get; set; }
		public DateTime FECHA_CREA_COTIZA_DETA { get; set; }
		public string ESTACION_CREA_COTIZA_DETA { get; set; }
		public string USUARIO_ACTU_COTIZA_DETA { get; set; }
		public DateTime FECHA_ACTU_COTIZA_DETA { get; set; }
		public string ESTACION_ACTU_COTIZA_DETA { get; set; }
		public bool SELECCION { get; set; }
	}
}
