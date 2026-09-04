using System;

namespace sguees.Models
{
	/// <summary>
	/// Lectura enriquecida (V_SC_SOLICITUD_REQUISICION → V_SC_REQUISICION_PERSONAL).
	/// </summary>
	public class SC_SOLICITUD_REQUISICIONView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_REQUISICION { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public DateOnly FECHA_REQUISICION { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		public int? CORR_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public string MODALIDAD_NOMBRE { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_VACANTE { get; set; }
		public int CANTIDAD_PLAZAS { get; set; }
		public int PLAZAS_CUBIERTAS { get; set; }
		public decimal SALARIO { get; set; }
		public int TIEMPO_CONTRATO { get; set; }
		public string HORARIO { get; set; }
		public string JUSTIFICACION { get; set; }
		public string CORR_EMPLEADO_SUSTITUTO { get; set; }
		public int CORR_ESTADO_REQUISICION { get; set; }
		public DateOnly? FECHA_APROBACION { get; set; }
		public DateOnly? FECHA_CIERRE { get; set; }
	}
}
