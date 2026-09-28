// Qué hace: modelo de lectura del tab Puestos (V_GEN_EMPLEADO_PUESTO).
// Cómo lo hace: proyecta la asignación y los nombres de unidad, puesto, contratación y modalidad.
using System;

namespace sguees.Models
{
	public class GEN_EMPLEADO_PUESTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public int CORR_UNIDAD { get; set; }
		public string CODIGO_UNIDAD { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public int CORR_PUESTO { get; set; }
		public string CODIGO_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public decimal? SUELDO { get; set; }
		public string HORARIO_LABORAL { get; set; }
		public int? CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public int? CORR_TIPO_MODALIDAD { get; set; }
		public string MODALIDAD_NOMBRE { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
