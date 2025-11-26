using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CONDICION_PAGOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
