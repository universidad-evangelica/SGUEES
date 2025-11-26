using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_COTIZACIONParam: BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int CORR_COTIZACION { get; set; }
		public string LOGIN_SISTEMA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
		public DateTime FECHA_INICIAL { get; set; }
		public DateTime FECHA_FINAL { get; set; }
	}
}
