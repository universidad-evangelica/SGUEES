// Qué hace: modelo de vista V_ACA_DOCUMENTO_ADMISION.
// Cómo lo hace: proyecta los mismos campos del catálogo para lectura y para el re-read tras guardar.
using System;

namespace sguees.Models
{
	public class ACA_DOCUMENTO_ADMISIONView
	{
		public int CORR_DOCUMENTO_ADMISION { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public string CODIGO { get; set; }
		public bool? OBLIGATORIO { get; set; }
		public int ORDEN { get; set; }
		public bool? ACTIVO { get; set; }
		public string FORMATOS_PERMITIDOS { get; set; }
		public byte TAMANO_MAXIMO_MB { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
