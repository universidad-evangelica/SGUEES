using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_PAGO_ARCHIVOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_ARCHIVO { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public DateTime FECHA_PAGO { get; set; }
		public string CODIGO_EMPRESARIAL { get; set; }
		public string CORRELATIVO { get; set; }
	}
}
