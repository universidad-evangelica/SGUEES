using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTO_TOTALTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_RUBRO { get; set; }
		public decimal MONTO_RUBRO { get; set; }
		public int IMPUESTO_INCLUIDO { get; set; }
		public int ORDEN_TOTAL { get; set; }
		public bool PERMITE_EDITAR { get; set; }
	}
}
