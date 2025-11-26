using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CUADRO_COMPARATIVO_ORDEN_COMPRAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int NUMERO_ORDEN { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
