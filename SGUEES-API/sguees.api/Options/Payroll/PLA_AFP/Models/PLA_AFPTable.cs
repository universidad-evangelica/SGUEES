// Qué hace: modelo de tabla PLA_AFP.
// Cómo lo hace: define PK, datos, Activo y campos de auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_AFPTable : BaseEntity
	{
		public int CORR_AFP { get; set; }
		public string NOMBRE_AFP { get; set; }
		public string NOMBRE_CORTO_AFP { get; set; }
		public string CODIGO_SGVPP { get; set; }
		public bool? INCLUYE_SEPP { get; set; }
		public bool? ACTIVO_AFP { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
