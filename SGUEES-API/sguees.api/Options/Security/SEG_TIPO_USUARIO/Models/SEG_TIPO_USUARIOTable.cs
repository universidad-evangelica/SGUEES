using System;
using eFramework.Data;

namespace scuees.Models
{
	public class SEG_TIPO_USUARIOTable: BaseEntity
	{
		public int TIPO_USUARIO { get; set; }
		public string NOMBRE_TIPO_USUARIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
