using System;
using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: modelo de lectura de parámetros SMTP (GEN_PARAMETRO_SMTP / V_GEN_PARAMETRO_SMTP).
	public class GEN_PARAMETRO_SMTPView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_SMTP { get; set; }
		public string CORREO_REMITENTE { get; set; }
		public string USUARIO_REMITENTE { get; set; }
		public string CONTRASENA_REMITENTE { get; set; }
		public string SERVIDOR_CORREO { get; set; }
		public int PUERTO_CORREO { get; set; }
		public bool USA_SSL_CORREO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
