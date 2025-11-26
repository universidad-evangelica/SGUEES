using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CUADRO_COMPARATIVO_SOLI_COTIZATable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int ANIO_PERIODO_SOLI_COTI { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		
	}
}
