using System;
using eFramework.Data;

namespace scuees.Models
{
	public class COM_TIPO_DOC_FISICOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public string NOMBRE_TIPO_DOCUMENTO { get; set; }
		public string NOMBRE_CORTO_TIPO_DOC { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
