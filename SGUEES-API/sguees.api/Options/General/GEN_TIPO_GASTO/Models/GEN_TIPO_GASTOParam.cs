using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_TIPO_GASTOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
