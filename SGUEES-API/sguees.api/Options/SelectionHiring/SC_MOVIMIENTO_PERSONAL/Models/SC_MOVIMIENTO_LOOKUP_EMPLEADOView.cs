namespace SGUEES.Models
{
	/// <summary>
	/// Lookup de empleado para sc-movimiento-personal (DIRECTO).
	/// Incluye snapshot listo para Posición actual + documento.
	/// </summary>
	public class SC_MOVIMIENTO_LOOKUP_EMPLEADOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public string CODIGO_EMPLEADO { get; set; }
		public string NOMBRE_COMPLETO { get; set; }
		public bool ES_EXTRANJERO { get; set; }
		public string NUMERO_ID { get; set; }

		public string GERENCIA_ACTUAL { get; set; }
		public int? CORR_UNIDAD_ACTUAL { get; set; }
		public string NOMBRE_UNIDAD_ACTUAL { get; set; }
		public int? CORR_PUESTO_ACTUAL { get; set; }
		public string NOMBRE_PUESTO_ACTUAL { get; set; }
		public decimal? SALARIO_ACTUAL { get; set; }
		public int? CORR_TIPO_MODALIDAD_ACTUAL { get; set; }
		public string NOMBRE_MODALIDAD_ACTUAL { get; set; }
		public string HORARIO_ACTUAL { get; set; }
	}
}
