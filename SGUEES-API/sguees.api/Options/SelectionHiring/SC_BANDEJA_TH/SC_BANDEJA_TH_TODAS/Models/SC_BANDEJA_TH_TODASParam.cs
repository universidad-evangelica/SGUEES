using System;
using eFramework.Data;

namespace SGUEES.Models
{
	// Qué hace: Modelo de parámetros para la consulta paginada y filtrada de la pestaña Todas en Bandeja TH.
	// Cómo lo hace: Hereda de BaseParam e incluye empresa, tipo de movimiento, área solicitante, rango de fechas y texto de búsqueda.
	public class SC_BANDEJA_TH_TODASParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public string TIPO { get; set; }
		public string ESTADO { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public DateTime? FECHA_DESDE { get; set; }
		public DateTime? FECHA_HASTA { get; set; }
		public string BUSQUEDA { get; set; }
		public int PAGE { get; set; } = 1;
		public int PAGE_SIZE { get; set; } = 50;
		public string SORT_FIELD { get; set; }
		public bool SORT_DESC { get; set; } = true;
	}
}
