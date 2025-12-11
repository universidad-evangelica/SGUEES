using System;

namespace sguees.Models
{
	public class GEN_TIPO_DOCUMENTO_RUBROView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NOMBRE_TIPO_DOC { get; set; }
		public int CORR_RUBRO { get; set; }
		public string NOMBRE_RUBRO { get; set; }
		public string CLASE_RUBRO { get; set; }
		public int ORDEN_TOTAL { get; set; }
		public bool PERMITE_EDITAR { get; set; }
		public bool ES_PRINCIPAL { get; set; }
		public string CLASE_DOCUMENTO { get; set; }
		public decimal POR_IMPUESTO { get; set; }
	}
}
