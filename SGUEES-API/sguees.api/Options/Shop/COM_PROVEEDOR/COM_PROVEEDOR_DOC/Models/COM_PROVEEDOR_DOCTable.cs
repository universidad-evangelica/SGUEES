using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_PROVEEDOR_DOCTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PROVEEDOR { get; set; }
		public int CORR_DOCUMENTO { get; set; }
	}
}
