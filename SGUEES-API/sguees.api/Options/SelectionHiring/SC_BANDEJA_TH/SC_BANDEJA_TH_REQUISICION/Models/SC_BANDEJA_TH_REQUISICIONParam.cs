using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_BANDEJA_TH_REQUISICIONParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int CORR_ESTADO_REQUISICION { get; set; }
		public int CORR_UNIDAD { get; set; }
		// Qué hace: Permite filtrar las requisiciones por el nombre del área o unidad solicitante.
		// Cómo lo hace: Se mapea desde la query string como cadena de texto.
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
