using System;
using eFramework.Data;

namespace sguees.Models
{
	public class SEG_CONFIG_OPCIONTable : BaseEntity
	{
		public string CODIGO_SISTEMA { get; set; }
		public string CODIGO_MENU { get; set; }
		public string CODIGO_OPCION { get; set; }
		public int ORDEN_SISTEMA { get; set; }
		public int ORDEN_MENU { get; set; }
		public int ORDEN_OPCION { get; set; }
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
	}
}
