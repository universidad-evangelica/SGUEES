using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_PARAMETROTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_AMBIENTE { get; set; }
		public string URL_CONSULTA { get; set; }
		public string CORREO_REMITENTE { get; set; }
		public string USUARIO_REMITENTE { get; set; }
		public string CONTRASENA_REMITENTE { get; set; }
		public string SERVIDOR_CORREO { get; set; }
		public int PUERTO_CORREO { get; set; }
		public bool USA_SSL_CORREO { get; set; }
		public bool HABILITAR_IMPRESION_TICKET { get; set; }
	}
}
