using System;

namespace sguees.Models
{
	public class COM_SOLI_COTIZACION_PROVEEDORView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string CODIGO_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public Boolean SELECCION { get; set; }
		public string ESTADO_COTIZACION { get; set; }
		public string NOMBRE_ESTADO_COTIZACION { get; set; }
		public DateTime ? FECHA_COTIZACION { get; set; } 
		public string USUARIO_COTIZA { get; set; }
		public string PLAZO_ENTREGA { get; set; }
		public string OBSERVACIONES { get; set; }
		public bool GENERAR_COTIZACION { get; set; }=false;
		public int CORR_CONDICION_PAGO { get; set; }
		public string NOMBRE_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string NOMBRE_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
	}
}
