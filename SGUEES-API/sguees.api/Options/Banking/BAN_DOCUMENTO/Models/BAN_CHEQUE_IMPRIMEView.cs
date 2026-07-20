using System;

namespace sguees.Models
{
	public class BAN_CHEQUE_IMPRIMEView
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string CLASE_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_CUENTA_BANCO { get; set; }
		public string NUMERO_CUENTA_BANCO { get; set; }
		public long NUMERO_DOCUMENTO { get; set; }
		public string SERIE_CHEQUE { get; set; }
		public string LUGAR_FECHA { get; set; }
		public DateTime FECHA_EMISION { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public decimal MONTO_DOCUMENTO { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public string NOMBRE_ESTADO_DOCUMENTO { get; set; }
		public string CANTIDAD_LETRAS { get; set; }
		public DateTime? FECHA_IMPRESO { get; set; }
		public int CORR_MOVIMIENTO { get; set; }
		public int CORR_TIPO_CHEQUE { get; set; }
		public string NOMBRE_TIPO_CHEQUE { get; set; }
		public int CORR_CHEQUERA { get; set; }
		public int CORR_DOCUMENTO_DETA { get; set; }
		public string CUENTA_CONTABLE { get; set; }
		public string NOMBRE_CUENTA { get; set; }
		public int CORR_CENTRO_COSTO { get; set; }
		public string NOMBRE_TRAN { get; set; }
		public decimal MONTO_CARGO { get; set; }
		public decimal MONTO_ABONO { get; set; }
		public string NOMBRE_MONEDA { get; set; }
		public string SIMBOLO_MONEDA { get; set; }
	}
}
