using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_BANDEJA_ACTORES_CANDIDATOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		/// <summary>Fijado en controller desde JWT.</summary>
		public string LOGIN_SISTEMA { get; set; }
		public int CORR_UNIDAD { get; set; }
		public DateTime? FECHA_DESDE { get; set; }
		public DateTime? FECHA_HASTA { get; set; }
		public string BUSQUEDA { get; set; }
		public int PAGE { get; set; } = 1;
		public int PAGE_SIZE { get; set; } = 50;
		public string SORT_FIELD { get; set; }
		public bool SORT_DESC { get; set; }
	}
}
