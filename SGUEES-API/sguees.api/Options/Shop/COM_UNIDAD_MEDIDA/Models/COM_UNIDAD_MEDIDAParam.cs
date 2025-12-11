using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_UNIDAD_MEDIDAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_UNIDAD_MEDIDA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
