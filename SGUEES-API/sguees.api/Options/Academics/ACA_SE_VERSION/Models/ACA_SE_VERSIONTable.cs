// Qué hace: modelo de tabla ACA_SE_VERSION.
// Cómo lo hace: PK, código, nombre, descripción, activo, vigencia y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_VERSIONTable : BaseEntity
	{
		public int CORR_VERSION { get; set; }
		public string CODIGO { get; set; }
		public string NOMBRE { get; set; }
		public string DESCRIPCION { get; set; }
		public bool? ACTIVO { get; set; }
		public DateTime? FECHA_VIGENCIA_INI { get; set; }
		public DateTime? FECHA_VIGENCIA_FIN { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
