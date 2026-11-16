using System;

namespace eadmindevprojectmanagement.Models
{
	public class COM_PAGOView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PAGO { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NOMBRE_TIPO_DOC { get; set; }
		public string NOMBRE_CORTO_TIPO_DOC { get; set; }
		public string CLASE_DOCUMENTO { get; set; }
		public int SUMA_RESTA { get; set; }
		public DateTime FECHA_SOLICITUD { get; set; }
		public DateTime FECHA_PAGO { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public int CORR_TIPO_CHEQUE { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public decimal MONTO_PAGO { get; set; }
		public int ANIO_PERIODO_CHEQUE { get; set; }
		public int MES_PERIODO_CHEQUE { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO_CHEQUE { get; set; }
		public string ESTADO_PAGO { get; set; }
		public string NOMBRE_ESTADO_PAGO { get; set; }
		public int ANIO_PERIODO_SOLI_CHEQUE { get; set; }
		public int MES_PERIODO_SOLI_CHEQUE { get; set; }
		public int CORR_TIPO_MOVIMIENTO_SOLI_CHEQUE { get; set; }
		public int CORR_DOCUMENTO_SOLI_CHEQUE { get; set; }
		public int CORR_MOVIMIENTO { get; set; }
		public bool PAGADO_CAJA_CHICA { get; set; }
		public int CORR_TIENDA { get; set; }
		public int CORR_CAJA { get; set; }
		public string NOMBRE_CAJA { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public int? CORR_ARCHIVO { get; set; }
		public DateTime? FECHA_PAGO_ARCHIVO { get; set; }
		public string CORRELATIVO { get; set; }
		public bool SELECCION { get; set; }
	}
}
