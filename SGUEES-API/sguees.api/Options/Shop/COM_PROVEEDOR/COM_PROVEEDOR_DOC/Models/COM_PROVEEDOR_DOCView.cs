using System;

namespace scuees.Models
{
	public class COM_PROVEEDOR_DOCView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public string DESCRIPCION_DOCUMENTO { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public string NOMBRE_TIPO_DOCUMENTO { get; set; }
		public string RUTA_DOCUMENTO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
	}
}
