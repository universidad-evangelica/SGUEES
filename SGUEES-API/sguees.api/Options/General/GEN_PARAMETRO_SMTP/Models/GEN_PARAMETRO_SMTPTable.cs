using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: entidad de escritura de GEN_PARAMETRO_SMTP.
	public class GEN_PARAMETRO_SMTPTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_SMTP { get; set; }
		public string CORREO_REMITENTE { get; set; }
		public string USUARIO_REMITENTE { get; set; }
		public string CONTRASENA_REMITENTE { get; set; }
		public string SERVIDOR_CORREO { get; set; }
		public int PUERTO_CORREO { get; set; }
		public bool USA_SSL_CORREO { get; set; }
	}
}
