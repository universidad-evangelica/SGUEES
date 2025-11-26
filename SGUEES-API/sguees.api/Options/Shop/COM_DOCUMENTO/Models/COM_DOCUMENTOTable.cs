using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public DateTime FECHA_VENCIMIENTO { get; set; }
		public int CORR_TIENDA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public string DESCRIPCION_PARTIDA { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public int DIAS_CREDITO { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public bool ESTA_CONTABILIZADO { get; set; }
		public decimal TOTAL_DOCUMENTO { get; set; }
		public decimal TOTAL_NETO { get; set; }
		public decimal SALDO_DOCUMENTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public int CORR_TIPO_PAGO { get; set; }
		public decimal CANTIDAD { get; set; }
		public int CORR_MOVIMIENTO { get; set; }
		public bool ESTA_PROVISIONADO { get; set; }
		public int CORR_MONEDA { get; set; }
		public decimal FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
		public string SERIE { get; set; }
		public long NUMERO_UNICO { get; set; }
		public string ESTADO_ADMINISTRATIVO { get; set; }
		public string CODIGO_GENERACION { get; set; }
		public string NUMERO_CONTROL { get; set; }
		public string SELLO_RECEPCION { get; set; }
		public int CORR_TIPO_INVALIDACION { get; set; }
		public DateTime FECHA_ANULACION { get; set; }
		public DateTime HORA_ANULACION { get; set; }
		public string MOTIVO_INVALIDACION { get; set; }
		public int ANIO_PERIODO_REEMPLAZA { get; set; }
		public int MES_PERIODO_REEMPLAZA { get; set; }
		public int CORR_DOCUMENTO_REEMPLAZA { get; set; }
		public string NUMERO_DUI_SOLICITA { get; set; }
		public string NOMBRE_SOLICITA { get; set; }
		public string NUMERO_DUI_RESPONSABLE { get; set; }
		public string NOMBRE_RESPONSABLE { get; set; }
		public string CODIGO_GENERACION_INVALIDACION { get; set; }
		public string SELLO_RECEPCION_INVALIDACION { get; set; }
		public int CORR_TIPO_OPERACION { get; set; }
		public int CORR_TIPO_GASTO_ISR { get; set; }
		public bool CREADO_DESDE_JSON { get; set; }
		public int CORR_EMPRESA_FE { get; set; }
		public int CORR_DOCUMENTO_FE { get; set; }
		public int ANIO_PERIODO_IVA { get; set; }
		public int MES_PERIODO_IVA { get; set; }
		public decimal MONTO_TOTAL_NO_SUJETO { get; set; }
		public decimal MONTO_TOTAL_EXENTO { get; set; }
		public decimal MONTO_TOTAL_GRAVADO { get; set; }
	}
}
