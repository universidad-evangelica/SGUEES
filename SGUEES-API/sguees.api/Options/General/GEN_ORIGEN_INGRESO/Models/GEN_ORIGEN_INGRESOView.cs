// Qué hace: modelo de vista V_GEN_ORIGEN_INGRESO.
// Cómo lo hace: proyecta los mismos campos del catálogo para lectura/OUTPUT tras CRUD.
using System;

namespace sguees.Models
{
	public class GEN_ORIGEN_INGRESOView
	{
		public int CORR_ORIGEN_INGRESO { get; set; }
		public string NOMBRE_ORIGEN_INGRESO { get; set; }
		public bool? ACTIVO_ORIGEN_INGRESO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
