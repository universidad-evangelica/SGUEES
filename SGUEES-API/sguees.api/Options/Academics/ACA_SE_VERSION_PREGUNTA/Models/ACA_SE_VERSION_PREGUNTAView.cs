// Qué hace: fila de V_ACA_SE_VERSION_PREGUNTA (versión, sección, pregunta, rol monto y asoc.).
using System;

namespace sguees.Models
{
	public class ACA_SE_VERSION_PREGUNTAView
	{
		public int CORR_VERSION_PREGUNTA { get; set; }
		public int CORR_VERSION { get; set; }
		public string CODIGO_VERSION { get; set; }
		public string NOMBRE_VERSION { get; set; }
		public int? CORR_SECCION_SE { get; set; }
		public string CODIGO_SECCION { get; set; }
		public string NOMBRE_SECCION { get; set; }
		public string TIPO_EVALUACION { get; set; }
		public int CORR_PREGUNTA { get; set; }
		public string CODIGO_PREGUNTA { get; set; }
		public string ENUNCIADO_PREGUNTA { get; set; }
		public int CORR_TIPO_PREGUNTA { get; set; }
		public string CODIGO_TIPO_PREGUNTA { get; set; }
		public string NOMBRE_TIPO_PREGUNTA { get; set; }
		public int ORDEN { get; set; }
		public decimal PUNTAJE { get; set; }
		public bool? ES_REQUERIDO { get; set; }
		public string ROL_MONTO { get; set; }
		public string NOMBRE_ROL_MONTO { get; set; }
		public int? CORR_PREGUNTA_BRUTO { get; set; }
		public string CODIGO_PREGUNTA_BRUTO { get; set; }
		public string ENUNCIADO_PREGUNTA_BRUTO { get; set; }
		public int? CORR_PREGUNTA_DESCUENTO { get; set; }
		public string CODIGO_PREGUNTA_DESCUENTO { get; set; }
		public string ENUNCIADO_PREGUNTA_DESCUENTO { get; set; }
		public bool? ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
