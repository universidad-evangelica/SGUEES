using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_TIPO_CONTRATACIONParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
