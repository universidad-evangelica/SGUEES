using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_PROVEEDOR_DOCParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
