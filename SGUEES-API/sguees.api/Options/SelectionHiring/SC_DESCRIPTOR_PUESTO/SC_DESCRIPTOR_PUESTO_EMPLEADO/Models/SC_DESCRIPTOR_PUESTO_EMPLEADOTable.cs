// Qué hace: campos de escritura de SC_DESCRIPTOR_PUESTO_EMPLEADO.
// Cómo lo hace: llave empresa + descriptor + empleado, más auditoría.
using System;
using eFramework.Data;

namespace SGUEES.Models
{
	public class SC_DESCRIPTOR_PUESTO_EMPLEADOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
