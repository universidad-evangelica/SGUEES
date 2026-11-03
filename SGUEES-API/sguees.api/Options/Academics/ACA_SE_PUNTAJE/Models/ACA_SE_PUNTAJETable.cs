// Qué hace: modelo de tabla ACA_SE_PUNTAJE.
// Cómo lo hace: pregunta/opción → puntaje/porcentaje con vigencia y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_PUNTAJETable : BaseEntity
	{
		public int CORR_PUNTAJE { get; set; }
		public int CORR_PREGUNTA { get; set; }
		public int? CORR_OPCION { get; set; }
		public decimal PUNTAJE { get; set; }
		public decimal PORCENTAJE { get; set; }
		public DateTime FECHA_INICIO { get; set; }
		public DateTime? FECHA_FIN { get; set; }
		public bool? ACTIVO { get; set; }
		public int CORR_EMPRESA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
