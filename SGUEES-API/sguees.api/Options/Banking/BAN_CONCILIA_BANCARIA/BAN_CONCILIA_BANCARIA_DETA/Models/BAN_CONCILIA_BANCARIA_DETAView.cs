using System;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIA_DETAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public int CORR_CONCILIACION_DETA { get; set; }
		public DateTime FECHA_MOVIMIENTO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string NUMERO_REFERENCIA_BANCO { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public int? ANIO_PERIODO { get; set; }
		public int? MES_PERIODO { get; set; }
		public int? CORR_CLASE_PARTIDA { get; set; }
		public int? CORR_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string NOMBRE_CORTO_CLASE { get; set; }
		public int? CORR_PARTIDA_DETA { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal MONTO_CARGO_CONTA { get; set; }
		public decimal MONTO_ABONO_CONTA { get; set; }
		public string CODIGO_TRANSACCION { get; set; }
		public string DESCRIPCION_TRANSACCION { get; set; }
	}
}
