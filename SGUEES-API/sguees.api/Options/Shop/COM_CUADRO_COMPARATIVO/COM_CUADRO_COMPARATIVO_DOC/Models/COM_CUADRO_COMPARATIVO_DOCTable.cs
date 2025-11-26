using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CUADRO_COMPARATIVO_DOCTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int CORR_DOCUMENTO { get; set; }
	}
}
