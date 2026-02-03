using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_TIPO_VACANTEParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_VACANTE { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
