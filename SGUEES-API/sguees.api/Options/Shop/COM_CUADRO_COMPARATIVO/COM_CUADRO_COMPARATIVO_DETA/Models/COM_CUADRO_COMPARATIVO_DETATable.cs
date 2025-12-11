using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_CUADRO_COMPARATIVO_DETATable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int ANIO_PERIODO_COTIZACION { get; set; }
		public int CORR_COTIZACION { get; set; }
		public int CORR_COTIZACION_DETA { get; set; }
		public bool SELECCION { get; set; }
		public string OBSERVACIONES { get; set; }
	}
}
