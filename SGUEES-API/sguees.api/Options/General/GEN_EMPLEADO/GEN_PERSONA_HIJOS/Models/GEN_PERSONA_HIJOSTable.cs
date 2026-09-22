// Qué hace: modelo de escritura de GEN_PERSONA_HIJOS.
// Cómo lo hace: define PK compuesta + datos del hijo y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_HIJOSTable : BaseEntity
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
