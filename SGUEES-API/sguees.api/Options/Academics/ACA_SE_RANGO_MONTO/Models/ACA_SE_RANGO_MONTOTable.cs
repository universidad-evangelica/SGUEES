// Qué hace: modelo de tabla ACA_SE_RANGO_MONTO.
// Cómo lo hace: PK, versión, sección, descripción, puntaje, rangos, orden, activo y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_RANGO_MONTOTable : BaseEntity
	{
		public int CORR_RANGO_MONTO { get; set; }
		public int CORR_VERSION { get; set; }
		public int CORR_SECCION_SE { get; set; }
		public string DESCRIPCION { get; set; }
		public decimal PUNTAJE { get; set; }
		public decimal RANGO_INICIAL { get; set; }
		public decimal RANGO_FINAL { get; set; }
		public int ORDEN { get; set; }
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
