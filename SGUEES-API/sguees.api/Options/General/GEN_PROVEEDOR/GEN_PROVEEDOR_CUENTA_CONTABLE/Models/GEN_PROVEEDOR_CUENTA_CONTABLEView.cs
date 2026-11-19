using System;

namespace sguees.Models
{
	public class GEN_PROVEEDOR_CUENTA_CONTABLEView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int CORR_CUENTA { get; set; }
		public string TIPO_CUENTA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public bool ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
