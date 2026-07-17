using System;

namespace sguees.Models
{
	// Proyección de lectura de V_GEN_GERENCIA (incluye datos de la división relacionada).
	public class GEN_GERENCIAView
	{
		// Ámbito de empresa.
		public int CORR_EMPRESA { get; set; }
		// PK de la gerencia.
		public int CORR_GERENCIA { get; set; }
		public string NOMBRE_GERENCIA { get; set; }
		public string CODIGO_GERENCIA { get; set; }
		// FK y datos descriptivos de la división.
		public int? CORR_DIVISION { get; set; }
		public string NOMBRE_DIVISION { get; set; }
		public string CODIGO_DIVISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
