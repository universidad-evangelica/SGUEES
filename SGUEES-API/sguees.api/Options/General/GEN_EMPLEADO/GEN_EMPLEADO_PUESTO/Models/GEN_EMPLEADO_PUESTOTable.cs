// Qué hace: modelo de escritura de GEN_EMPLEADO_PUESTO.
// Cómo lo hace: llave unidad+puesto y campos editables. HORARIO_LABORAL no se escribe (queda NULL).
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPLEADO_PUESTOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public int CORR_UNIDAD { get; set; }
		public int CORR_PUESTO { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public decimal? SUELDO { get; set; }
		public int? CORR_TIPO_CONTRATACION { get; set; }
		public int? CORR_TIPO_MODALIDAD { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
