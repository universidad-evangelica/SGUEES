using System;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTO_TOTALView
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_RUBRO { get; set; }
		public bool ES_IMPUESTO { get; set; }
		public string CLASE_RUBRO { get; set; }
		public string NOMBRE_RUBRO { get; set; }
		public decimal MONTO_RUBRO { get; set; }
		public bool PERMITE_EDITAR { get; set; }
		public int IMPUESTO_INCLUIDO { get; set; }
		public string TIPO_APLICACION { get; set; }
		public decimal POR_IMPUESTO { get; set; }
		public int ORDEN_TOTAL { get; set; }
	}
}
