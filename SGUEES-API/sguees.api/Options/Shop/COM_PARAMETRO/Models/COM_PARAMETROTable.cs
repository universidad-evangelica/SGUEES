using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_PARAMETROTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string GERENTE_COMPRAS { get; set; }
		public string GERENTE_CONTABILIDAD { get; set; }
		public string GERENTE_GENERAL { get; set; }
		public string RECTOR { get; set; }
		public string URL_DOCUMENTO { get; set; }
        public string CORREO_REMITENTE { get; set; }
        public string USUARIO_REMITENTE { get; set; }
        public string CONTRASENA_REMITENTE { get; set; }
        public string SERVIDOR_CORREO { get; set; }
        public int PUERTO_CORREO { get; set; }
        public bool USA_SSL_CORREO { get; set; }
        public string NOMBRE_USUARIO_COPIAR { get; set; }
        public string CORREO_ELECTRONICO_COPIAR { get; set; }
	}
}
