// Qué hace: modelo de tabla GEN_ACTIVIDAD_ECONOMICA.
// Cómo lo hace: define PK, código, nombre, activo y campos de auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_ACTIVIDAD_ECONOMICATable : BaseEntity
	{
		public int CORR_ACTIVIDAD_ECONOMICA { get; set; }
		public string CODIGO_ACTIVIDAD_ECONOMICA { get; set; }
		public string NOMBRE_ACTIVIDAD_ECONOMICA { get; set; }
		public bool? ACTIVO_ACTIVIDAD_ECONOMICA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
