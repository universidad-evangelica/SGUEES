using System;

namespace sguees.Models
{
	public class SEG_OPCION_SISTEMAView
	{
		public string CODIGO_OPCION { get; set; }
		public string NOMBRE_OPCION { get; set; }
		public string URL_OPCION { get; set; }
		public string IMAGEN_OPCION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
