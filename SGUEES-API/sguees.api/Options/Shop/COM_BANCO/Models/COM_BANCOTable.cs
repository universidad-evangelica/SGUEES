using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_BANCOTable: BaseEntity
	{
		public int CORR_BANCO { get; set; }
		public string NOMBRE_BANCO { get; set; }
		public string NOMBRE_BANCO_CORTO { get; set; }
		public string CLASE_BANCO { get; set; }
		public string CODIGO_TRANSACION_UNI { get; set; }
	}
}
