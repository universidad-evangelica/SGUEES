using System;

namespace sguees.Models
{
	public class COM_PROVEEDOR_USUARIOView
	{
		public int CORR_PROVEEDOR { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string NOMBRE_USUARIO { get; set; }
		public string CORREO_ELECTRONICO { get; set; }
		public int ESTADO_USUARIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
