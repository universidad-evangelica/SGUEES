// Qué hace: fila de V_ACA_SE_OPCION (incluye datos de la pregunta).
using System;

namespace sguees.Models
{
	public class ACA_SE_OPCIONView
	{
		public int CORR_OPCION { get; set; }
		public int CORR_PREGUNTA { get; set; }
		public string CODIGO_PREGUNTA { get; set; }
		public string ENUNCIADO_PREGUNTA { get; set; }
		public string CODIGO { get; set; }
		public string TEXTO { get; set; }
		public int ORDEN { get; set; }
		public bool? ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
