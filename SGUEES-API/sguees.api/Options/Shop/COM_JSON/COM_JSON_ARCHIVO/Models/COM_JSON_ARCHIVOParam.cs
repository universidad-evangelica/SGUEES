using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_JSON_ARCHIVOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
