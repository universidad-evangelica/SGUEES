// Qué hace: modelo de lectura de familiar UEES (con nombre de parentesco).
// Cómo lo hace: proyecta campos de V_GEN_PERSONA_FAMILIAR_UEES para el tab Adicional.
using System;

namespace sguees.Models
{
	public class GEN_PERSONA_FAMILIAR_UEESView
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_FAMILIAR_UEES { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public int? CORR_PARENTESCO { get; set; }
		public string NOMBRE_PARENTESCO { get; set; }
		public string TELEFONO { get; set; }
		public string CARGO { get; set; }
		public string LUGAR_TRABAJO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
