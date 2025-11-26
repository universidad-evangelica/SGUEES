using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_TIPO_DOCUMENTO_RUBROParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public int CORR_RUBRO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
