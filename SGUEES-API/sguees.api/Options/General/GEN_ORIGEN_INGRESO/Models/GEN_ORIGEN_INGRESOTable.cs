// Qué hace: modelo de tabla GEN_ORIGEN_INGRESO.
// Cómo lo hace: define PK, nombre, activo y campos de auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_ORIGEN_INGRESOTable : BaseEntity
	{
		public int CORR_ORIGEN_INGRESO { get; set; }
		public string NOMBRE_ORIGEN_INGRESO { get; set; }
		public bool? ACTIVO_ORIGEN_INGRESO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
