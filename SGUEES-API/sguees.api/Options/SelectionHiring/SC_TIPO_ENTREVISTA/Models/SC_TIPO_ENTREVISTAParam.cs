using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_TIPO_ENTREVISTAParam: BaseParam
	{
		public int OPCION_CONSULTA { get; set; } = 0;
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_ENTREVISTA { get; set; }
	}
}
