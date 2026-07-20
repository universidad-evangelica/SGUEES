using System;
using eFramework.Data;

namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public DateTime? FECHA_INICIAL { get; set; }
		public DateTime? FECHA_FINAL { get; set; }
		public short? AUMENTA_DISMINUYE { get; set; }
	}
}
