using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_ORDEN_COMPRATable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int NUMERO_ORDEN { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public decimal MONTO_TOTAL_ORDEN { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public int CORR_FORMA_PAGO { get; set; }
		public string DETALLE_FORMA_PAGO { get; set; }
	}
}
