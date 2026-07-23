using System;
using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: define la entidad de persistencia de la tabla GEN_DIVISION.
	public class GEN_DIVISIONTable : BaseEntity
	{
		// Qué hace: correlativo de empresa (ámbito del registro).
		public int CORR_EMPRESA { get; set; }
		// Qué hace: correlativo de la división (clave primaria relativa).
		public int CORR_DIVISION { get; set; }
		public string NOMBRE_DIVISION { get; set; }
		public string CODIGO_DIVISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
