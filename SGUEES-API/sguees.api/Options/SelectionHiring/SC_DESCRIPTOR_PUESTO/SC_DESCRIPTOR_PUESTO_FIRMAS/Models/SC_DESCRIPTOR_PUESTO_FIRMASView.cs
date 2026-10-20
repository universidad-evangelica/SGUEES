// Qué hace: fila de lectura de una firma del descriptor.
// Cómo lo hace: expone el nombre, el actor y la unidad tal como quedaron guardados.
using System;

namespace SGUEES.Models
{
	public class SC_DESCRIPTOR_PUESTO_FIRMASView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_FIRMAS { get; set; }
		public int? CORR_DESCRIPTOR_PUESTO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public string TIPO_JEFE { get; set; }
		public string TIPO_ACTOR { get; set; }
		public DateTime? FECHA_FIRMA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
