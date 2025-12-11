using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_DIPTable: BaseEntity
	{
		public int CORR_TIPO_DIP { get; set; }
		public string CODIGO_TIPO_DIP { get; set; }
		public string NOMBRE_TIPO_DIP { get; set; }
	}
}
