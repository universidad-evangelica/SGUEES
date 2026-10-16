// Qué hace: modelo de lectura para las versiones de una plantilla de correo (V_GEN_PARAMETRO_PLANTILLA_VERSION).
// Cómo lo hace: contiene campos informativos de la plantilla, número de versión, bandera de versión activa y auditoría.
using System;

namespace sguees.Models
{
	public class GEN_PARAMETRO_PLANTILLA_VERSIONView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_PLANTILLA { get; set; }
		public string CODIGO_PLANTILLA { get; set; }
		public string NOMBRE_PLANTILLA { get; set; }
		public int NUMERO_VERSION { get; set; }
		public string ASUNTO_PLANTILLA { get; set; }
		public string CUERPO_PLANTILLA { get; set; }
		public string CORREO_CC { get; set; }
		public string CORREO_CCO { get; set; }
		public bool ES_VERSION_ACTIVA { get; set; }
		public string MOTIVO_VERSION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
