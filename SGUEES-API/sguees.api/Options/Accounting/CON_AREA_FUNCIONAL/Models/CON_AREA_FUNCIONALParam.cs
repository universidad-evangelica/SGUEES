using System;
using eFramework.Data;

namespace sguees.Models
{
	public class CON_AREA_FUNCIONALParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_AREA_FUNCIONAL { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
