using System;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_CONFIG_AUTORIZACIONESView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CONFIGURACION { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public string NOMBRE_CARGO { get; set; }
		public decimal MONTO_INICIAL { get; set; }
		public decimal MONTO_FINAL { get; set; }
		public string CLASE_AUTORIZACION { get; set; }
		public string NOMBRE_CLASE_AUTORIZACION { get; set; }
		public int ORDEN_REVISION { get; set; }
		public bool PERMITE_MODIFICAR { get; set; }
	}
}
