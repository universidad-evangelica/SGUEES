using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_ORDEN_COMPRATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_ORDEN_COMPRA { get; set; }
		public int? CORR_TIPO_DOC { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string ATENCION_A { get; set; }
		public DateTime FECHA_ORDEN { get; set; }
		public string ESTADO_ORDEN { get; set; }
		public string USUARIO_AUTORIZA { get; set; }
		public DateTime? FECHA_AUTORIZA { get; set; }
		public string OBSERVACIONES { get; set; }
		public decimal? COMPRA_TOTAL { get; set; }
		public string MONTO_EN_LETRAS { get; set; }
		public int? NUMERO_ORDEN_COMPRA { get; set; }
		public int? CORR_CONDICION_PAGO { get; set; }
		public int? CORR_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
