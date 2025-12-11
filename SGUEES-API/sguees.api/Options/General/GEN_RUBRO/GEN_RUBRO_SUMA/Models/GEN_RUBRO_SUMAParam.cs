using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_RUBRO_SUMAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_RUBRO { get; set; }
		public int CORR_SUMA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
