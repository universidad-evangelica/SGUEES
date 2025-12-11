using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_RUBROParam: BaseParam
	{
		public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int CORR_RUBRO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
