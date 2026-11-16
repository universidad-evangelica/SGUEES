using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_PAGOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PAGO { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public DateTime FECHA_SOLICITUD { get; set; }
		public DateTime FECHA_PAGO { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int? CORR_TIPO_CHEQUE { get; set; }
		public int? CORR_CUENTA_BANCO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public decimal MONTO_PAGO { get; set; }
		public int? ANIO_PERIODO_CHEQUE { get; set; }
		public int? MES_PERIODO_CHEQUE { get; set; }
		public int? CORR_TIPO_MOVIMIENTO { get; set; }
		public int? CORR_DOCUMENTO_CHEQUE { get; set; }
		public string ESTADO_PAGO { get; set; }
		public int? ANIO_PERIODO_SOLI_CHEQUE { get; set; }
		public int? MES_PERIODO_SOLI_CHEQUE { get; set; }
		public int? CORR_TIPO_MOVIMIENTO_SOLI_CHEQUE { get; set; }
		public int? CORR_DOCUMENTO_SOLI_CHEQUE { get; set; }
		public int? CORR_MOVIMIENTO { get; set; }
		public bool? PAGADO_CAJA_CHICA { get; set; }
		public int? CORR_TIENDA { get; set; }
		public int? CORR_CAJA { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public int? CORR_ARCHIVO { get; set; }
		public bool GENERA_MOVIMIENTO_BANCARIO { get; set; } = true;
		public string USUARIO_ACTU { get; set; }
	}
}
