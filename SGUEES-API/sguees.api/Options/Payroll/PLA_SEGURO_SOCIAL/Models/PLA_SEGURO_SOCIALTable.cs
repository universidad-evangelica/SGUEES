// Qué hace: modelo de tabla PLA_SEGURO_SOCIAL.
// Cómo lo hace: define PK, datos, Activo y campos de auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_SEGURO_SOCIALTable : BaseEntity
	{
		public int CORR_SEGURO_SOCIAL { get; set; }
		public string NOMBRE_SEGURO_SOCIAL { get; set; }
		public string NOMBRE_CORTO_SEGURO { get; set; }
		public bool? ACTIVO_SEGURO_SOCIAL { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
