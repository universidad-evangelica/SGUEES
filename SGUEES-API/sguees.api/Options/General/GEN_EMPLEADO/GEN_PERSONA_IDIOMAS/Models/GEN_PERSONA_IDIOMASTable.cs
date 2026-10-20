// Qué hace: modelo de escritura de GEN_PERSONA_IDIOMAS.
// Cómo lo hace: define PK compuesta + datos del idioma y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_IDIOMASTable : BaseEntity
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
