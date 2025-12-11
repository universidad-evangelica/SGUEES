using System;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_AUTORIZACIONESView
	{
		public int CORR_EMPRESA { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string NOMBRE_USUARIO { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public DateTime? FECHA_AUTORIZACION { get; set; }
		public string ESTADO_AUTORIZACION { get; set; }
		public string NOMBRE_ESTADO_AUTORIZACION { get; set; }
		public int ORDEN_REVISION { get; set; }
	}
}
