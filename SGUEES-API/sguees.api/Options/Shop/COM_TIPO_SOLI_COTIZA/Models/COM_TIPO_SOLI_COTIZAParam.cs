using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_TIPO_SOLI_COTIZAParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_SOLI_COTIZA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
