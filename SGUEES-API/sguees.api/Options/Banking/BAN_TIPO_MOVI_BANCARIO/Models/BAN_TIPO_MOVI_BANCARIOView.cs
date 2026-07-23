using System;

namespace sguees.Models
{
	public class BAN_TIPO_MOVI_BANCARIOView
	{
		public int CORR_EMPRESA { get; set; }
		public int SUMA_RESTA { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_REPORTE { get; set; }
		public string CLASE_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_CORTO { get; set; }
		public string CUENTA_CONTABLE_GASTO { get; set; }
		public bool USA_CHEQUE_PROPIO { get; set; }
		public int CORR_LINEA { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_LINEA_TRABAJO { get; set; }
		public string NOMBRE_CLASE_MOVIMIENTO { get; set; }
		public string NOMBRE_SUMA_RESTA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public bool? ESTADO_TIPO_MOVIMIENTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
