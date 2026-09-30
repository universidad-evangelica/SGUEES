// Qué hace: fila de lectura del empleado cargado en el descriptor.
// Cómo lo hace: llave del vínculo más datos de V_GEN_EMPLEADO.
using System;

namespace SGUEES.Models
{
	public class SC_DESCRIPTOR_PUESTO_EMPLEADOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public string NOMBRE_EMPLEADO { get; set; }
		public string DUI { get; set; }
		public DateTime? FECHA_INGRESO { get; set; }
		public string CORREO_INSTITUCIONAL { get; set; }
		public string TELEFONO_INSTITUCIONAL { get; set; }
		public string LOGIN_SISTEMA_WEB { get; set; }
		public bool? ACTIVO_EMPLEADO { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
