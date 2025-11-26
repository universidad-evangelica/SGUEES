using System;

namespace scuees.Models
{
	public class COM_COTIZACION_CORREOView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
        public DateTime FECHA_COTIZACION { get; set; }
        public string OBSERVACIONES { get; set; }
        public string NOMBRE_PROVEEDOR { get; set; }
        public string CORREO_ELECTRONICO { get; set; }
        public string CORREO_ELECTRONICO_CCO { get; set; }
        public string CORREO_REMITENTE { get; set; }
        public string USUARIO_REMITENTE { get; set; }
        public string CONTRASENA_REMITENTE { get; set; }
        public string SERVIDOR_CORREO { get; set; }
        public int PUERTO_CORREO { get; set; }
        public bool USA_SSL_CORREO { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
	}
}
