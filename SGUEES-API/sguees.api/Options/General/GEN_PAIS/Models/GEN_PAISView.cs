using System;

namespace sguees.Models
{
	public class GEN_PAISView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PAIS { get; set; }
		public string NOMBRE_PAIS { get; set; }
		public string CODIGO_PAIS { get; set; }
		public string NACIONALIDAD { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
