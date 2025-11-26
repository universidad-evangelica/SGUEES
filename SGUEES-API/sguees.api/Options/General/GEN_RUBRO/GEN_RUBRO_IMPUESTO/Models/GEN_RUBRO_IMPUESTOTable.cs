using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_RUBRO_IMPUESTOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_RUBRO { get; set; }
		public int CORR_IMPUESTO { get; set; }
		public bool IMPUESTO_INCLUIDO { get; set; }
	}
}
