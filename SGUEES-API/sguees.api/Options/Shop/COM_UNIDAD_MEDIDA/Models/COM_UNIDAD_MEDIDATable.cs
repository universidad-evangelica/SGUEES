using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_UNIDAD_MEDIDATable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_UNIDAD_MEDIDA { get; set; }
		public string NOMBRE_UNIDAD_MEDIDA { get; set; }
		public string NOMBRE_CORTO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
