using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CUADRO_COMPARATIVOParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
		public int ANIO_PERIODO_SOLI_COTI { get; set; }
		public int CORR_SOLI_COTIZACION { get; set; }
		public string USUARIO_CREA { get; set; }
	}
}
