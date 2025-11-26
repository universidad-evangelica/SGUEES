using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_MUNICIPIOParam: BaseParam
	{
		public string CODIGO_DEPTO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
