using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_GASTO_IMPUESTOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public int CORR_RUBRO { get; set; }
		public bool IMPUESTO_INCLUIDO { get; set; }
		public int ORDEN_TOTAL { get; set; }
		public bool PERMITE_EDITAR { get; set; }
	}
}
