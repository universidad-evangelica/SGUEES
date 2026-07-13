using System;

namespace sguees.Models
{
	public class BAN_LINEA_TRABAJO_CONCILIACIONView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_LINEA { get; set; }
		public string NOMBRE_LINEA_TRABAJO { get; set; }
		public int AUMENTA_DISMINUYE { get; set; }
		public string NOMBRE_AUMENTA_DISMINUYE { get; set; }
		public bool? ESTADO_LINEA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
