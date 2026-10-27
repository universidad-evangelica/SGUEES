// Qué hace: fila de V_ACA_SE_PREGUNTA (incluye datos del tipo).
using System;

namespace sguees.Models
{
	public class ACA_SE_PREGUNTAView
	{
		public int CORR_PREGUNTA { get; set; }
		public int CORR_TIPO_PREGUNTA { get; set; }
		public string CODIGO_TIPO_PREGUNTA { get; set; }
		public string NOMBRE_TIPO_PREGUNTA { get; set; }
		public string CODIGO { get; set; }
		public string ENUNCIADO { get; set; }
		public string AYUDA { get; set; }
		public bool? ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
