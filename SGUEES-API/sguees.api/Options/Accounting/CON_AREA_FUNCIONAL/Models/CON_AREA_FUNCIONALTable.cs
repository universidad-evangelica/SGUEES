using System;
using eFramework.Data;

namespace sguees.Models
{
	public class CON_AREA_FUNCIONALTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_AREA_FUNCIONAL { get; set; }
		public string NOMBRE_AREA_FUNCIONAL { get; set; }
		public string CODIGO_AREA_FUNCIONAL { get; set; }
	}
}
