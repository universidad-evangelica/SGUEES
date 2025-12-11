using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_GASTO_IMPUESTOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public int CORR_RUBRO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
