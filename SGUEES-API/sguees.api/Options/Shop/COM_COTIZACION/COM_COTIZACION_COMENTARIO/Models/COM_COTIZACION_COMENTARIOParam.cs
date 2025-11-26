using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_COTIZACION_COMENTARIOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COMENTARIO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
