using System;
using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: define la entidad de persistencia de la tabla GEN_GERENCIA.
	public class GEN_GERENCIATable : BaseEntity
	{
		// Qué hace: correlativo de empresa.
		public int CORR_EMPRESA { get; set; }
		// Qué hace: correlativo de la gerencia dentro de la empresa.
		public int CORR_GERENCIA { get; set; }
		public string NOMBRE_GERENCIA { get; set; }
		public string CODIGO_GERENCIA { get; set; }
		// Qué hace: FK opcional a la división asociada.
		public int? CORR_DIVISION { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
