using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_FORMA_PAGOParam: BaseParam
	{
		public int CORR_FORMA_PAGO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
