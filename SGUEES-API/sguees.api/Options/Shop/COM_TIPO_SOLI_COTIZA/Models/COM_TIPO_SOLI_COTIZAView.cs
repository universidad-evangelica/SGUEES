using System;

namespace scuees.Models
{
	public class COM_TIPO_SOLI_COTIZAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_SOLI_COTIZA { get; set; }
		public string NOMBRE_TIPO_SOLI_COTIZA { get; set; }
		public string CLASE_SOLI_COTIZA { get; set; }
		public string NOMBRE_CLASE_SOLI_COTIZA { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
