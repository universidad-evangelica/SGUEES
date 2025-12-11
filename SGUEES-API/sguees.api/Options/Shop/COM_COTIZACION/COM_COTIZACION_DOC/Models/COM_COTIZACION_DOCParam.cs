using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_COTIZACION_DOCParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
