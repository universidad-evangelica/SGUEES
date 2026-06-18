using System;
using eFramework.Data;

namespace sguees.Models
{
	public class CON_CENTRO_COSTOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
