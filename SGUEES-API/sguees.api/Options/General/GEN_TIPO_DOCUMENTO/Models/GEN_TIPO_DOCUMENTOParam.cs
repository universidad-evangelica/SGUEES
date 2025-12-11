using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_DOCUMENTOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public Boolean USAR_COMPRAS { get; set; }
	}
}
