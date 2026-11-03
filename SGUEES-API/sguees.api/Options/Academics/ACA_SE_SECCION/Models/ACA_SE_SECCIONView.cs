// Qué hace: fila de V_ACA_SE_SECCION (incluye datos de versión).
using System;

namespace sguees.Models
{
	public class ACA_SE_SECCIONView
	{
		public int CORR_SECCION_SE { get; set; }
		public int CORR_VERSION { get; set; }
		public string CODIGO_VERSION { get; set; }
		public string NOMBRE_VERSION { get; set; }
		public string NOMBRE_SECCION { get; set; }
		public string DESCRIPCION { get; set; }
		public int ORDEN { get; set; }
		public decimal? PUNTAJE_MAXIMO { get; set; }
		public decimal? PORCENTAJE_SECCION { get; set; }
		public bool? ACTIVO { get; set; }
		public int CORR_EMPRESA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
