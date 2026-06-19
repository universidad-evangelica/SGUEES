using System;

namespace sguees.Models
{
	public class CON_PARTIDA_MODELOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public string ESTADO_PARTIDA { get; set; }
		public string NOMBRE_ESTADO_PARTIDA { get; set; }
		public string CLASE_PARTIDA { get; set; }
		public int? CORR_MONEDA { get; set; }
		public decimal? FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
