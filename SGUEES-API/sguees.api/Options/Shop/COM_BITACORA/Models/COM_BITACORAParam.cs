using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_BITACORAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_BITACORA { get; set; }
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
		public string CODIGO_OPCION { get; set; }
		public string CLASE_BITACORA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
