using System;
using eFramework.Data;

namespace sguees.Models
{
	public class COM_DOCUMENTO_FISICOTable: BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO { get; set; }
		public string NOMBRE_DOCUMENTO { get; set; }
		public string DESCRIPCION_DOCUMENTO { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public string RUTA_DOCUMENTO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
