// Qué hace: modelo de tabla GEN_PARENTESCO.
// Cómo lo hace: define PK, nombre, descripción, activo y campos de auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PARENTESCOTable : BaseEntity
	{
		public int CORR_PARENTESCO { get; set; }
		public string NOMBRE_PARENTESCO { get; set; }
		public string DESCRIPCION { get; set; }
		public bool? ACTIVO_PARENTESCO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
