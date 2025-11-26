using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_TIPO_DOCUMENTOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NOMBRE_TIPO_DOC { get; set; }
		public string NOMBRE_CORTO_TIPO_DOC { get; set; }
		public bool USAR_VENTAS { get; set; }
		public bool USAR_COMPRAS { get; set; }
		public string CLASE_DOCUMENTO { get; set; }
		public int SUMA_RESTA { get; set; }
		public string LIBRO_IVA { get; set; }
		public bool ES_ELECTRONICO { get; set; }
	}
}
