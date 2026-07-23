using System;

namespace SGUEES.Models
{
	// Qué hace: define la proyección de lectura de V_GEN_DEPTO (incluye nombre del país).
	public class GEN_DEPTOView
	{
		// Qué hace: FK al país padre.
		public int CORR_PAIS { get; set; }
		// Qué hace: correlativo del departamento.
		public int CORR_DEPTO { get; set; }
		public string NOMBRE_DEPTO { get; set; }
		public string CODIGO_DEPTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		// Qué hace: nombre descriptivo del país relacionado.
		public string NOMBRE_PAIS { get; set; }
	}
}
