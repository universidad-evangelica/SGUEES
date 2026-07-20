using System;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIA_PENDIENTEView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public DateTime FECHA_PARTIDA { get; set; }
		public string NOMBRE_CLASE_PARTIDA { get; set; }
		public string ESTADO_PARTIDA { get; set; }
		public int CORR_PARTIDA_DETA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public decimal MONTO_CARGO_FORANEA { get; set; }
		public decimal MONTO_ABONO_FORANEA { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public bool ESTA_CONCILIA { get; set; }
	}
}
