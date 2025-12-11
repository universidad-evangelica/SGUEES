using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_COTIZACION_DETA_DOCTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COTIZACION_DETA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
	}
}
