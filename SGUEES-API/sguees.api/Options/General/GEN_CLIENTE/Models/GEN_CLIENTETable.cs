using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_CLIENTETable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CLIENTE { get; set; }
		public string CODIGO_CLIENTE { get; set; }
		public string NOMBRE_CLIENTE { get; set; }
		public string NOMBRE_CONTACTO { get; set; }
		public string DUI { get; set; }
		public string NIT { get; set; }
		public string TELEFONO_1 { get; set; }
		public string CORREO_ELECTRONICO { get; set; }
		public bool? ESTA_ACTIVO { get; set; } = true;
		public string USUARIO_CREA { get; set; }
		public DateTime FECHA_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime FECHA_ACTU { get; set; }
	}
}
