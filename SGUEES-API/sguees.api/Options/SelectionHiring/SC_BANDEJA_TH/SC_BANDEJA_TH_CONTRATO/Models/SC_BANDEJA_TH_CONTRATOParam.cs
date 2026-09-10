using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_BANDEJA_TH_CONTRATOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public DateTime? FECHA_DESDE { get; set; }
		public DateTime? FECHA_HASTA { get; set; }
		public string BUSQUEDA { get; set; }
		public int PAGE { get; set; } = 1;
		public int PAGE_SIZE { get; set; } = 50;
		public string SORT_FIELD { get; set; }
		public bool SORT_DESC { get; set; }
	}
}
