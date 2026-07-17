using System;
using eFramework.Data;

namespace sguees.Models
{
	// Entidad de persistencia de la tabla GEN_DIVISION (divisiones por empresa).
	public class GEN_DIVISIONTable : BaseEntity
	{
		// FK/ámbito de empresa.
		public int CORR_EMPRESA { get; set; }
		// PK de la división dentro de la empresa.
		public int CORR_DIVISION { get; set; }
		public string NOMBRE_DIVISION { get; set; }
		public string CODIGO_DIVISION { get; set; }
		// Auditoría de creación/actualización.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
