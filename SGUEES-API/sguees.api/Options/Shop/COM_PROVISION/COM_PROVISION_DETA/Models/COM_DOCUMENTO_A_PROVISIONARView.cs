using System;

namespace sguees.Models
{
	public class COM_DOCUMENTO_A_PROVISIONARView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public string NOMBRE_CORTO_TIPO_DOC { get; set; }
		public string NOMBRE_TIPO_DOC { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public DateTime? FECHA_VENCIMIENTO { get; set; }
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
		public int CORR_TIPO_GASTO { get; set; }
		public decimal CANTIDAD { get; set; }
		public int CORR_MOVIMIENTO { get; set; }
		public bool ESTA_PROVISIONADO { get; set; }
		public bool SELECCION { get; set; }
		public int? CORR_PROVISION { get; set; }
	}
}
