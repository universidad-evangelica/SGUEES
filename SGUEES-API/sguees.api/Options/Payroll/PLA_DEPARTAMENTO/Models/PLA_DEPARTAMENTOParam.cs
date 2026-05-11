using System;
using eFramework.Data;

namespace sguees.Models
{
	public class PLA_DEPARTAMENTOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DEPARTAMENTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
