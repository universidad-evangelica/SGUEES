using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_PAISParam: BaseParam
	{
		public int CODIGO_PAIS { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
