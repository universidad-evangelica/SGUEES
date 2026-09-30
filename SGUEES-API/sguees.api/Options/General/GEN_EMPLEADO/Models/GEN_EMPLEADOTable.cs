// Qué hace: modelo de tabla GEN_EMPLEADO.
// Cómo lo hace: define PK empresa+empleado, vínculo a persona, AFP/SS y auditoría.
using System;
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPLEADOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public long? CORR_PERSONA { get; set; }
		public string CODIGO_EMPLEADO { get; set; }
		public int? CORR_SEGURO_SOCIAL { get; set; }
		public string ESTADO_NIP { get; set; }
		public int? CORR_AFP { get; set; }
		public DateTime? FECHA_AFILIACION_AFP { get; set; }
		public DateTime? FECHA_INCORPORACION_SP { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public string CORREO_INSTITUCIONAL { get; set; }
		public string TELEFONO_INSTITUCIONAL { get; set; }
		public bool? ACTIVO_EMPLEADO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
