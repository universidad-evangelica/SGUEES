using System;

namespace sguees.Models
{
	// Qué hace: modelo de lectura de plantillas de correo (V_GEN_PARAMETRO_PLANTILLA).
	// Cómo lo hace: incluye campos de la plantilla, datos del correo remitente y auditoría.
	public class GEN_PARAMETRO_PLANTILLAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_PLANTILLA { get; set; }
		public string CODIGO_PLANTILLA { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public string ASUNTO_PLANTILLA { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public int CORR_PARAMETRO_SMTP { get; set; }
		public string CORREO_REMITENTE { get; set; }
		public string SERVIDOR_CORREO { get; set; }
		public string CORREO_CC { get; set; }
		public string CORREO_CCO { get; set; }
		public bool ACTIVO_PLANTILLA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
