// Qué hace: lectura de una asignación documento-solicitud.
// Cómo: proyecta V_ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTO.
using System;

namespace SGUEES.Models
{
	public class ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public string NOMBRE_TIPO { get; set; }
		public int CORR_DOCUMENTO_ADMISION { get; set; }
		public string CODIGO { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public int ORDEN { get; set; }
		public bool OBLIGATORIO { get; set; }
		public bool ACTIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
