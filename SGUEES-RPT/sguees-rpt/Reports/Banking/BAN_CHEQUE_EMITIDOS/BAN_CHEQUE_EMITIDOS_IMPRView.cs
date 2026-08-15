using System;

namespace sgueesRpt.Reports.Banking.BAN_CHEQUE_EMITIDOS
{
	public class BAN_CHEQUE_EMITIDOS_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_EMPRESA { get; set; }
		public string PERIODO { get; set; }
		public byte[] LOGO1 { get; set; }
		public byte[] LOGO2 { get; set; }
		public string TITULO_REPORTE { get; set; }
		public string NOMBRE_SISTEMA { get; set; }
		public DateTime FECHA_IMPRESION { get; set; }

		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string CLASE_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_CUENTA_BANCO { get; set; }
		public int NUMERO_DOCUMENTO { get; set; }
		public DateTime? FECHA_EMISION { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public int CORR_CLIENTE { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public decimal MONTO_DOCUMENTO { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public string NOMBRE_ESTADO_DOCUMENTO { get; set; }
		public bool ESTA_CONTABILIZADO { get; set; }
		public string HECHO_POR { get; set; }
		public string REVISADO_POR { get; set; }
		public string APROBADO_POR { get; set; }
		public string CONTADOR_REVISO { get; set; }
		public string AUDITOR_REVISO { get; set; }
		public DateTime? FECHA_GENERACION { get; set; }
		public DateTime? FECHA_APROBADO { get; set; }
		public DateTime? FECHA_IMPRESO { get; set; }
		public string CANTIDAD_LETRAS { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_MOVIMIENTO { get; set; }
		public int CORR_MOVIMIENTO_DESTINO { get; set; }
		public int CORR_TIPO_CHEQUE { get; set; }
		public string NOMBRE_TIPO_CHEQUE { get; set; }
		public string CLASE_TIPO_CHEQUE { get; set; }
		public int CORR_CHEQUERA { get; set; }
		public string SERIE_CHEQUE { get; set; }
		public int CORR_CUENTA_BANCO_DESTINO { get; set; }
		public string NUMERO_CUENTA_BANCO_DESTINO { get; set; }
		public string NUMERO_CUENTA_DESTINO_TERCERO { get; set; }
		public decimal MONTO_DESTINO { get; set; }
		public int? ANIO_PERIODO_CHEQUE { get; set; }
		public int? MES_PERIODO_CHEQUE { get; set; }
		public int? CORR_TIPO_MOVIMIENTO_CHEQUE { get; set; }
		public int? CORR_DOCUMENTO_CHEQUE { get; set; }
		public DateTime? FECHA_ANULACION { get; set; }
		public int CORR_MONEDA { get; set; }
		public string NOMBRE_MONEDA { get; set; }
		public string SIMBOLO { get; set; }
		public decimal FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
		public int? NUMERO { get; set; }
	}
}
