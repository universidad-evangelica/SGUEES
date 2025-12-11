using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_GASTOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public string NOMBRE_TIPO_GASTO { get; set; }
		public bool ES_SERVICIO { get; set; }
		public bool ES_INTANGIBLE { get; set; }
	}
}
