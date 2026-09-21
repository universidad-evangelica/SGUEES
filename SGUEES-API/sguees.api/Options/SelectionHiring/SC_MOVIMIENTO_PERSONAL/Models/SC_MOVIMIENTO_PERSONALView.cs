using System;

namespace SGUEES.Models
{
	/// <summary>
	/// Lectura de V_SC_MOVIMIENTO_PERSONAL (incluye nombres de unidad/puesto/modalidad).
	/// </summary>
	public class SC_MOVIMIENTO_PERSONALView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public DateTime FECHA_ELABORACION { get; set; }
		public string ORIGEN_MOVIMIENTO { get; set; }
		public string TIPO_MOVIMIENTO { get; set; }
		public string ESTADO_MOVIMIENTO { get; set; }
		public string NOMBRE_ESTADO_MOVIMIENTO { get; set; }
		public string NOMBRE_TIPO_MOVIMIENTO { get; set; }
		public string NOMBRE_ORIGEN_MOVIMIENTO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public string NUMERO_ID { get; set; }
		public DateTime? FECHA_INGRESO_PROPUESTA { get; set; }
		public DateTime? FECHA_FINALIZACION { get; set; }
		public string GERENCIA_ACTUAL { get; set; }
		public int? CORR_UNIDAD_ACTUAL { get; set; }
		public string NOMBRE_UNIDAD_ACTUAL { get; set; }
		public int? CORR_PUESTO_ACTUAL { get; set; }
		public string NOMBRE_PUESTO_ACTUAL { get; set; }
		public decimal? SALARIO_ACTUAL { get; set; }
		public int? CORR_TIPO_MODALIDAD_ACTUAL { get; set; }
		public string NOMBRE_MODALIDAD_ACTUAL { get; set; }
		public string HORARIO_ACTUAL { get; set; }
		public string GERENCIA_PROPUESTA { get; set; }
		public int? CORR_UNIDAD_PROPUESTA { get; set; }
		public string NOMBRE_UNIDAD_PROPUESTA { get; set; }
		public int? CORR_PUESTO_PROPUESTO { get; set; }
		public string NOMBRE_PUESTO_PROPUESTO { get; set; }
		public decimal? SALARIO_PROPUESTO { get; set; }
		public int? CORR_TIPO_MODALIDAD_PROPUESTA { get; set; }
		public string NOMBRE_MODALIDAD_PROPUESTA { get; set; }
		public string HORARIO_PROPUESTO { get; set; }
		public string JUSTIFICACION { get; set; }
		public DateTime? FECHA_EFECTIVA { get; set; }
		public bool CONFIRMADO { get; set; }
		public string NOMBRE_CONFIRMACION { get; set; }
		public string USUARIO_CONFIRMA { get; set; }
		public DateTime? FECHA_CONFIRMA { get; set; }
		public string USUARIO_CREA { get; set; }
		public string ESTACION_CREA { get; set; }
		public DateTime? FECHA_CREA { get; set; }
		public string USUARIO_ACTU { get; set; }
		public string ESTACION_ACTU { get; set; }
		public DateTime? FECHA_ACTU { get; set; }
	}
}
