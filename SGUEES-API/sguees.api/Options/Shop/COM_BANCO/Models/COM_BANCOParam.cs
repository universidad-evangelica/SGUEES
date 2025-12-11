using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_BANCOParam: BaseParam
	{
		public int CORR_BANCO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
