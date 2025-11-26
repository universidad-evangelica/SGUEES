using System;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTO_CRView
	{
		public int CORR_RETENCION { get; set; }
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public DateTime FECHA_CR { get; set; }
		public string DESCRIPCION_CR { get; set; }
		public string ESTADO_CR { get; set; }
		public decimal MONTO_RETENIDO { get; set; }
		public decimal MONTO_TOTAL { get; set; }
		public string CODIGO_GENERACION { get; set; }
		public string NUMERO_CONTROL { get; set; }
		public string SELLO_RECEPCION { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }


	}
}
