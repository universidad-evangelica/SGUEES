using System;

namespace scuees.Models
{
	public class COM_SOLI_COMPRAView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
        public int ANIO_PERIODO_SOLI_COMPRA { get; set; }
		public int CORR_SOLI_COMPRA { get; set; }
		public DateTime FECHA_SOLI_COTIZACION { get; set; }
		public DateTime FECHA_LIMITE_COTIZACION { get; set; }
		public DateTime FECHA_SOLICITUD_COMPRA { get; set; }
		public string CODIGO_DEPTO { get; set; }
		public string NOMBRE_DEPTO { get; set; }
		public string USUARIO_SOLI { get; set; }
		public string OBSERVACIONES { get; set; }
		public string ESTADO_SOLI_COTIZACION { get; set; }
		public string NOMBRE_ESTADO_SOLI_COTIZACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public string NUMERO_SOLI_COMPRA { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
	}
}
