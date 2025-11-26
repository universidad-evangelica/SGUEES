using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_JSON_DOCParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public string NOMBRE_ARCHIVO { get; set; }

	}
}
