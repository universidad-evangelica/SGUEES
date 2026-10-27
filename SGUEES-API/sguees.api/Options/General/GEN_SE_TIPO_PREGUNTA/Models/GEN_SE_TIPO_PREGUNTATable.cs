// Qué hace: modelo de tabla GEN_SE_TIPO_PREGUNTA.
// Cómo lo hace: PK, código, nombre, activo y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_SE_TIPO_PREGUNTATable : BaseEntity
	{
		public int CORR_TIPO_PREGUNTA { get; set; }
		public string CODIGO { get; set; }
		public string NOMBRE { get; set; }
		public bool? ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
