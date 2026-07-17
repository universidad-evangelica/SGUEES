using System;
using eFramework.Data;

namespace sguees.Models
{
	// Entidad de persistencia de la tabla GEN_GERENCIA (gerencias por empresa).
	public class GEN_GERENCIATable : BaseEntity
	{
		// FK/ámbito de empresa.
		public int CORR_EMPRESA { get; set; }
		// PK de la gerencia dentro de la empresa.
		public int CORR_GERENCIA { get; set; }
		public string NOMBRE_GERENCIA { get; set; }
		public string CODIGO_GERENCIA { get; set; }
		// FK opcional a la división asociada.
		public int? CORR_DIVISION { get; set; }
		// Auditoría de creación/actualización.
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
