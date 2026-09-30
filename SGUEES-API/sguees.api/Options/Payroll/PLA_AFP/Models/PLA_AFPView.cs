// Qué hace: modelo de vista V_PLA_AFP.
// Cómo lo hace: proyecta datos, Activo y auditoría para lectura/OUTPUT tras CRUD.
using System;

namespace SGUEES.Models
{
	public class PLA_AFPView
	{
		public int CORR_AFP { get; set; }
		public string NOMBRE_AFP { get; set; }
		public string NOMBRE_CORTO_AFP { get; set; }
		public string CODIGO_SGVPP { get; set; }
		public bool? INCLUYE_SEPP { get; set; }
		public bool? ACTIVO_AFP { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
