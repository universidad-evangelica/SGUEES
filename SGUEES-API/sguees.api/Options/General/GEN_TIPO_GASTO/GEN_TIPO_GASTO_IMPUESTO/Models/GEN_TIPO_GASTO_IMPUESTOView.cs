using System;

namespace scuees.Models
{
	public class GEN_TIPO_GASTO_IMPUESTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public int CORR_RUBRO { get; set; }
		public bool IMPUESTO_INCLUIDO { get; set; }
		public int ORDEN_TOTAL { get; set; }
		public bool PERMITE_EDITAR { get; set; }
		public string NOMBRE_RUBRO { get; set; }
		public decimal POR_IMPUESTO { get; set; }
		public bool MUESTRA_TOTAL { get; set; }
		public string CLASE_RUBRO { get; set; }
	}
}
