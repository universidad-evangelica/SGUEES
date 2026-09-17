// Qué hace: modelo de tabla GEN_TIPO_CONTRIBUYENTE.
// Cómo lo hace: define PK, nombre, activo y campos de auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_CONTRIBUYENTETable : BaseEntity
	{
		public int CORR_TIPO_CONTRIBUYENTE { get; set; }
		public string NOMBRE_TIPO_CONTRIBUYENTE { get; set; }
		public bool? ACTIVO_TIPO_CONTRIBUYENTE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
