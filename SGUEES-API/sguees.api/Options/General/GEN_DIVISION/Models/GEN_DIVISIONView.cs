using System;

namespace sguees.Models
{
	// Qué hace: define la proyección de lectura de V_GEN_DIVISION.
	public class GEN_DIVISIONView
	{
		// Qué hace: correlativo de empresa.
		public int CORR_EMPRESA { get; set; }
		// Qué hace: correlativo de la división.
		public int CORR_DIVISION { get; set; }
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
