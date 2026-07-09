using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SC_REQUISICION_OBSERVADORESParam: BaseParam
	{
		public int OPCION_CONSULTA { get; set; } = 0;
		public int CORR_EMPRESA { get; set; }
		public int CORR_REQUISICION_OBSERVADORES { get; set; }
	}
}
