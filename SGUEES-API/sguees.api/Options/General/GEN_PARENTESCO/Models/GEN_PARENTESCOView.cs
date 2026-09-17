// Qué hace: modelo de vista V_GEN_PARENTESCO.
// Cómo lo hace: proyecta los mismos campos del catálogo para lectura/OUTPUT tras CRUD.
using System;

namespace sguees.Models
{
	public class GEN_PARENTESCOView
	{
		public int CORR_PARENTESCO { get; set; }
		public string NOMBRE_PARENTESCO { get; set; }
		public string DESCRIPCION { get; set; }
		public bool? ACTIVO_PARENTESCO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
