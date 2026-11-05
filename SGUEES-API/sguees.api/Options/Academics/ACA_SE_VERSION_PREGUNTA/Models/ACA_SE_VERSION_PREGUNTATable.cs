// Qué hace: modelo de tabla ACA_SE_VERSION_PREGUNTA.
// Cómo lo hace: PK, FKs versión/sección/pregunta, orden, puntaje, ROL_MONTO/asoc. líquido, activo y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_VERSION_PREGUNTATable : BaseEntity
	{
		public int CORR_VERSION_PREGUNTA { get; set; }
		public int CORR_VERSION { get; set; }
		public int? CORR_SECCION_SE { get; set; }
		public int CORR_PREGUNTA { get; set; }
		public int ORDEN { get; set; }
		public decimal PUNTAJE { get; set; }
		public bool? ES_REQUERIDO { get; set; }
		public string ROL_MONTO { get; set; }
		public int? CORR_PREGUNTA_BRUTO { get; set; }
		public int? CORR_PREGUNTA_DESCUENTO { get; set; }
		public bool? ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
