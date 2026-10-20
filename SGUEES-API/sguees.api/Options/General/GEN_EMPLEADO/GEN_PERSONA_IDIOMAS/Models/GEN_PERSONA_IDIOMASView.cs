// Qué hace: modelo de lectura de idiomas de persona.
// Cómo lo hace: proyecta campos de V_GEN_PERSONA_IDIOMAS para el tab Idiomas.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_IDIOMASView
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_IDIOMA { get; set; }
		public string NOMBRE_IDIOMA { get; set; }
		public string NIVEL_DOMINIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
