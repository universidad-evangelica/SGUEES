using System;
using eFramework.Data;

namespace sguees.Models
{
	public class BAN_SOLI_CHEQUETable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int? CORR_CUENTA_BANCO { get; set; }
		public long NUMERO_DOCUMENTO { get; set; }
		public DateTime FECHA_EMISION { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public int? CORR_PROVEEDOR { get; set; }
		public int? CORR_EMPLEADO { get; set; }
		public int? CORR_CLIENTE { get; set; }
		public string NOMBRE_BENEFICIARIO { get; set; }
		public decimal MONTO_DOCUMENTO { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public string SOLICITADO_POR { get; set; }
		public DateTime? FECHA_SOLICITADO { get; set; }
		public string APLICADO_POR { get; set; }
		public DateTime? FECHA_APLICADO { get; set; }
		public string CANTIDAD_LETRAS { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int? CORR_TIPO_CHEQUE { get; set; }
		public int? ANIO_PERIODO_CHEQUE { get; set; }
		public int? MES_PERIODO_CHEQUE { get; set; }
		public int? CORR_TIPO_MOVIMIENTO_CHEQUE { get; set; }
		public int? CORR_DOCUMENTO_CHEQUE { get; set; }
		public int? CORR_MONEDA { get; set; }
		public decimal? FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
	}
}
