using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_DOCUMENTO_FISICOParam: BaseParam
	{
		public int CORR_SUSCRIPCION { get; set; }
		public int CORR_CONFI_PAIS { get; set; }
		public int CORR_EMPRESA { get; set; }
		public string CODIGO_SUITE { get; set; }
		public int CORR_DOCUMENTO { get; set; }
 		public int OPCION_CONSULTA { get; set; } = 0;

	}
}
