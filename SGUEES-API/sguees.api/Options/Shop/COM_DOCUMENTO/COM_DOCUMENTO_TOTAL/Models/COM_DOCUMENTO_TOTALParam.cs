using System;
using eFramework.Data;

namespace eadmindevprojectmanagement.Models
{
	public class COM_DOCUMENTO_TOTALParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_RUBRO { get; set; }
		public int CORR_TIPO_GASTO { get; set; }
		public int CORR_TIPO_DOC { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
