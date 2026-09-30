using System;

namespace SGUEES.Models
{
	/// <summary>Requisición ligada a un movimiento, solo consulta del tab.</summary>
	public class SC_MOVIMIENTO_REQUISICION_CARDView
	{
		public int CORR_REQUISICION_PERSONAL { get; set; }
		public int CORR_REQUISICION_CANDIDATO { get; set; }
		public DateTime? FECHA_REQUISICION { get; set; }
		public int CORR_ESTADO_REQUISICION { get; set; }
		public string NOMBRE_ESTADO { get; set; }
		public string DISPLAY_UNIDAD { get; set; }
		public string NOMBRE_PUESTO { get; set; }
		public string MODALIDAD_NOMBRE { get; set; }
		public int CORR_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_CONTRATACION { get; set; }
		public string NOMBRE_TIPO_VACANTE { get; set; }
		public int CANTIDAD_PLAZAS { get; set; }
		public int PLAZAS_CUBIERTAS { get; set; }
		public decimal SALARIO { get; set; }
		public int TIEMPO_CONTRATO { get; set; }
		public string HORARIO { get; set; }
		public string CORR_EMPLEADO_SUSTITUTO { get; set; }
		public string JUSTIFICACION { get; set; }
	}
}
