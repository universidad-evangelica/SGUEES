// Qué hace: payload del SP PRAL_MTTO_GEN_EMPLEADO (personales + datos empleado).
// Cómo lo hace: extiende GEN_PERSONA_NATURALTable con columnas de GEN_EMPLEADO.
using System;

namespace sguees.Models
{
	public class GEN_EMPLEADO_MTTOTable : GEN_PERSONA_NATURALTable
	{
		public int CORR_EMPLEADO { get; set; }
		public string CODIGO_EMPLEADO { get; set; }
		public int? CORR_SEGURO_SOCIAL { get; set; }
		public string ESTADO_NIP { get; set; }
		public int? CORR_AFP { get; set; }
		public DateTime? FECHA_AFILIACION_AFP { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public string CORREO_INSTITUCIONAL { get; set; }
		public string TELEFONO_INSTITUCIONAL { get; set; }
		public bool? ACTIVO_EMPLEADO { get; set; }
	}
}
