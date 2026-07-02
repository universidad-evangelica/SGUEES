using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_GERENCIATable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_GERENCIA { get; set; }
		public string NOMBRE_GERENCIA { get; set; }
		public string CODIGO_GERENCIA { get; set; }
		public int? CORR_DIVISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
