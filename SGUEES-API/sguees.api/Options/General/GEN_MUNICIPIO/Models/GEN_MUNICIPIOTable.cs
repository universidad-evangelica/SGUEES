using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_MUNICIPIOTable: BaseEntity
	{
		public string CODIGO_DEPTO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
	}
}
