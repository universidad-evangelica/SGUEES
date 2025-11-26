using System;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NOMBRE_TIPO_DOC { get; set; }
		public string NOMBRE_CORTO_TIPO_DOC { get; set; }
		public string CLASE_DOCUMENTO { get; set; }
		public int SUMA_RESTA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string NUMERO_DOCUMENTO_CORR { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public DateTime FECHA_VENCIMIENTO { get; set; }
		public int CORR_TIENDA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public string NOMBRE_PROVEEDOR { get; set; }
		public string DESCRIPCION_PARTIDA { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public string NOMBRE_CONDICION_PAGO { get; set; }
		public int DIAS_CREDITO { get; set; }
		public string ESTADO_DOCUMENTO { get; set; }
		public string NOMBRE_ESTADO_DOCUMENTO { get; set; }
		public bool ESTA_CONTABILIZADO { get; set; }
		public decimal TOTAL_DOCUMENTO { get; set; }
		public decimal TOTAL_NETO { get; set; }
		public decimal SALDO_DOCUMENTO { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public string NOMBRE_TIPO_GASTO { get; set; }
		public decimal CANTIDAD { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public int CORR_MOVIMIENTO { get; set; }
		public int CORR_MONEDA { get; set; }
		public decimal FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
		public string SERIE { get; set; }
		public int NUMERO_UNICO { get; set; }
		public string ESTADO_ADMINISTRATIVO { get; set; }
		public string NOMBRE_ESTADO_ADMINISTRATIVO { get; set; }
		public string CODIGO_GENERACION { get; set; }
		public string NUMERO_CONTROL { get; set; }
		public string SELLO_RECEPCION { get; set; }
		public bool SELECCION { get; set; }
		public int ANIO_PERIODO_IVA { get; set; }
		public int MES_PERIODO_IVA { get; set; }
		public bool ES_ELECTRONICO { get; set; }
		public int CORR_EMPRESA_FE { get; set; }
		public int CORR_DOCUMENTO_FE { get; set; }
	}
}
