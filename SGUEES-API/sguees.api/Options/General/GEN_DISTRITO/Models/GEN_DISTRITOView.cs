using System;

namespace SGUEES.Models
{
	// Proyección de lectura de V_GEN_DISTRITO (incluye nombres de la jerarquía territorial).
	public class GEN_DISTRITOView
	{
		// FK al municipio padre.
		public int CORR_MUNICIPIO { get; set; }
		// PK del distrito.
		public int CORR_DISTRITO { get; set; }
		public int CORR_DEPTO { get; set; }
		public string NOMBRE_DISTRITO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		// Nombres descriptivos de la jerarquía.
		public string NOMBRE_MUNICIPIO { get; set; }
		public int CORR_PAIS { get; set; }
		public string NOMBRE_DEPTO { get; set; }
		public string NOMBRE_PAIS { get; set; }
	}
}
