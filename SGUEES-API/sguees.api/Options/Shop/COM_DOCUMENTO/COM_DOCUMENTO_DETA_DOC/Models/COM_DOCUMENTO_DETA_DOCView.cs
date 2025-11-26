using System;

namespace scuees.Models
{
	public class COM_DOCUMENTO_DETA_DOCView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int ANIO_PERIODO_DOC { get; set; }
		public int MES_PERIODO_DOC { get; set; }
		public int CORR_DOCUMENTO_DOC { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string NOMBRE_TIPO_DOC { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public decimal MONTO_DOCUMENTO { get; set; }
		public decimal MONTO_INICIAL { get; set; }
		public decimal MONTO_INGRESO { get; set; }
		public decimal MONTO_FINAL { get; set; }
	}
}
