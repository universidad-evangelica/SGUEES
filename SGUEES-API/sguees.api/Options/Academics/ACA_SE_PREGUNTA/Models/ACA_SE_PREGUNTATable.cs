// Qué hace: modelo de tabla ACA_SE_PREGUNTA.
// Cómo lo hace: PK, tipo, código, enunciado, ayuda, activo y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_PREGUNTATable : BaseEntity
	{
		public int CORR_PREGUNTA { get; set; }
		public int CORR_TIPO_PREGUNTA { get; set; }
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
