using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_COTIZACION_COMENTARIOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COMENTARIO { get; set; }
		public string CLASE_COMENTARIO { get; set; }
		public string COMENTARIO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
