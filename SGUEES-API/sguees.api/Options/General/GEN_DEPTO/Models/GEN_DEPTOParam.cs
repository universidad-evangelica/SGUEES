using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_DEPTOParam: BaseParam
	{
		public string CODIGO_DEPTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
