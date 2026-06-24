using System;

namespace sguees.Models
{
	public class CON_PARTIDA_APLICARView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public string NOMBRE_CORTO_CLASE { get; set; }
		public int CORR_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public DateTime FECHA_PARTIDA { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public string ESTADO_PARTIDA { get; set; }
		public string NOMBRE_ESTADO_PARTIDA { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public bool SELECCION { get; set; }
	}
}
