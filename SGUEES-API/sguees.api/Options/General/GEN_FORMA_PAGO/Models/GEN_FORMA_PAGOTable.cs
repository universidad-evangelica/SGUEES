using System;
using eFramework.Data;

namespace scuees.Models
{
	public class GEN_FORMA_PAGOTable: BaseEntity
	{
		public int CORR_FORMA_PAGO { get; set; }
		public string CODIGO_FORMA_PAGO { get; set; }
		public string NOMBRE_FORMA_PAGO { get; set; }
		public string CLASE_FORMA_PAGO { get; set; }
	}
}
