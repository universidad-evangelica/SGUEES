using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SEG_TIPO_USUARIOParam: BaseParam
	{
		public int TIPO_USUARIO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
