// Qué hace: modelo de lectura de hijo de persona.
// Cómo lo hace: proyecta campos de V_GEN_PERSONA_HIJOS para el tab Familiares.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_HIJOSView
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_HIJO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public int? EDAD { get; set; }
		public string SEXO { get; set; }
		public DateTime? FECHA_NACIMIENTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
