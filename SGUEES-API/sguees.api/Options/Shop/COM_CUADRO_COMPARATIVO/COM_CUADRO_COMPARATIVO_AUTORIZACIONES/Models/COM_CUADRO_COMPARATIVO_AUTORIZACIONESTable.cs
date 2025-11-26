using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_CUADRO_COMPARATIVO_AUTORIZACIONESTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_CUADRO_COMPARATIVO { get; set; }
		public DateTime FECHA_AUTORIZACION { get; set; }
		public string ESTADO_AUTORIZACION { get; set; }
		public int ORDEN_REVISION { get; set; }
	}
}
