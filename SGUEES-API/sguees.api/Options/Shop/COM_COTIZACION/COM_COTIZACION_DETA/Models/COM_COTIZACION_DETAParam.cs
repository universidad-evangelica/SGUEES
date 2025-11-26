using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_COTIZACION_DETAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COTIZACION_DETA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
