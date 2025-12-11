using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_ORDEN_COMPRATable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public DateTime FECHA_COTIZACION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string USUARIO_COTIZA { get; set; }
		public string OBSERVACIONES { get; set; }
		public string OBSERVACIONES_PROVEEDOR { get; set; }
		public string PLAZO_ENTREGA { get; set; }
		public string ESTADO_COTIZACION { get; set; }
		public int ANIO_PERIODO_SOLI_COTI { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
	}
}
