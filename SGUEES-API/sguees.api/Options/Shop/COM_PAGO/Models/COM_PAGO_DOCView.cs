using System;

namespace eadmindevprojectmanagement.Models
{
	public class COM_PAGO_DOCView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_PAGO { get; set; }
		public int ANIO_PERIODO_CHEQUE { get; set; }
		public int MES_PERIODO_CHEQUE { get; set; }
		public int CORR_TIPO_MOVIMIENTO_CHEQUE { get; set; }
		public int CORR_DOCUMENTO_CHEQUE { get; set; }
		public string TIPO_DOCUMENTO { get; set; }
		public DateTime FECHA_DOCUMENTO { get; set; }
		public int NUMERO_DOCUMENTO { get; set; }
		public string FORMA { get; set; }
		public string ID_DOCUMENTO { get; set; }
	}
}
