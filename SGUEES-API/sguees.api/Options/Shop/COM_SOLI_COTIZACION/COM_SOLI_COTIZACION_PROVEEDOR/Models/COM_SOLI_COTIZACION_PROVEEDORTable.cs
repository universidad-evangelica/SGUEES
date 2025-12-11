using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_SOLI_COTIZACION_PROVEEDORTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public bool GENERAR_COTIZACION { get; set; }=false;
		public int CORR_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }

	}
}
