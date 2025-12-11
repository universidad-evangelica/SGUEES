using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_PARAMETROParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
