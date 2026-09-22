// Qué hace: modelo de escritura de GEN_PERSONA_REFERENCIA_PERSONAL.
// Cómo lo hace: define PK compuesta + datos de la referencia y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_REFERENCIA_PERSONALTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public long CORR_PERSONA { get; set; }
		public int CORR_REFERENCIA_PERSONAL { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public string DIRECCION { get; set; }
		public string TELEFONO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
