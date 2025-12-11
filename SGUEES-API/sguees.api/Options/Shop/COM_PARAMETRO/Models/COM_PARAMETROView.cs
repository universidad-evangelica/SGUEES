using System;

namespace sguees.Models
{
	public class COM_PARAMETROView
	{
		public int CORR_EMPRESA { get; set; }
		public string URL_DOCUMENTO { get; set; }
		public string CORREO_ELECTRONICO { get; set; }
        public string CORREO_REMITENTE { get; set; }
        public string USUARIO_REMITENTE { get; set; }
        public string CONTRASENA_REMITENTE { get; set; }
        public string SERVIDOR_CORREO { get; set; }
        public int PUERTO_CORREO { get; set; }
        public bool USA_SSL_CORREO { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public string NOMBRE_USUARIO_COPIAR { get; set; }
        public string CORREO_ELECTRONICO_COPIAR { get; set; }
        public string USUARIO_FE { get; set; }
        public string CLAVE_FE { get; set; }
        public string CODIGO_SUITE_FE { get; set; }
	}
}
