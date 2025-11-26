using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_SOLI_COTIZACION_PROVEEDORParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
