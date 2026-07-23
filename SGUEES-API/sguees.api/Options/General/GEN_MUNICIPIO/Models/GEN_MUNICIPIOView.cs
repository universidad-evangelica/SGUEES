using System;

namespace SGUEES.Models
{
	// Qué hace: define la proyección de lectura de V_GEN_MUNICIPIO (incluye nombres de depto y país).
	public class GEN_MUNICIPIOView
	{
		// Qué hace: FK al departamento padre.
		public int CORR_DEPTO { get; set; }
		// Qué hace: correlativo del municipio.
		public int CORR_MUNICIPIO { get; set; }
		// Qué hace: FK al país.
		public int CORR_PAIS { get; set; }
		public string NOMBRE_MUNICIPIO { get; set; }
		public string CODIGO_MUNICIPIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		// Qué hace: nombres descriptivos de la jerarquía.
		public string NOMBRE_DEPTO { get; set; }
		public string NOMBRE_PAIS { get; set; }
	}
}
