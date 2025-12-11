using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_TIPO_DOC_FISICOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
