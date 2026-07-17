using System;

namespace SGUEES.Models
{
	// Proyección de lectura de V_GEN_MUNICIPIO (incluye nombres de depto y país).
	public class GEN_MUNICIPIOView
	{
		// FK al departamento padre.
		public int CORR_DEPTO { get; set; }
		// PK del municipio.
		public int CORR_MUNICIPIO { get; set; }
		// FK al país.
		public int CORR_PAIS { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		// Nombres descriptivos de la jerarquía.
		public string NOMBRE_DEPTO { get; set; }
		public string NOMBRE_PAIS { get; set; }
	}
}
