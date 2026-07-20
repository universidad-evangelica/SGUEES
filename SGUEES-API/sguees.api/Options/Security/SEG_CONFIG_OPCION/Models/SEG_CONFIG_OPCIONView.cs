using System;

namespace sguees.Models
{
	public class SEG_CONFIG_OPCIONView
	{
		public string CODIGO_SISTEMA { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public string IMAGEN_SISTEMA { get; set; }
		public string CODIGO_MENU { get; set; }
		public string NOMBRE_MENU { get; set; }
		public string IMAGEN_MENU { get; set; }
		public string CODIGO_OPCION { get; set; }
		public string NOMBRE_OPCION { get; set; }
		public string IMAGEN_OPCION { get; set; }
		public string URL_OPCION { get; set; }
		public int ORDEN_SISTEMA { get; set; }
		public int ORDEN_MENU { get; set; }
		public int ORDEN_OPCION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
