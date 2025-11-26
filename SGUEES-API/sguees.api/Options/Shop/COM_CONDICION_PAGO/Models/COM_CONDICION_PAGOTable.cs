using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CONDICION_PAGOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CONDICION_PAGO { get; set; }
		public string NOMBRE_CONDICION_PAGO { get; set; }
		public int DIAS_CREDITO { get; set; }
	}
}
