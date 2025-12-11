using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_PROVEEDORParam: BaseParam
	{
		public int CORR_PROVEEDOR { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
