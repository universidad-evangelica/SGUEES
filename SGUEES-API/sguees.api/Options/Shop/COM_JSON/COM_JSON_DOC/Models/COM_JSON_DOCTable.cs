using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_JSON_DOCTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public int CORR_DOCUMENTO_DOC { get; set; }
	}
}
