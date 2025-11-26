using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_TIPO_DOCUMENTO_RUBROTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public int CORR_RUBRO { get; set; }
		public int ORDEN_TOTAL { get; set; }
		public bool PERMITE_EDITAR { get; set; }
		public bool ES_PRINCIPAL { get; set; }
	}
}
