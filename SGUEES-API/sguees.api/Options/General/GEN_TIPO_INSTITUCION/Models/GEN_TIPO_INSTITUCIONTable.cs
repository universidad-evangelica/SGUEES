// Qué hace: modelo de tabla GEN_TIPO_INSTITUCION.
// Cómo lo hace: PK, nombre, activo y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_INSTITUCIONTable : BaseEntity
	{
		public int CORR_TIPO_INSTITUCION { get; set; }
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
