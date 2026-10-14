namespace SGUEES.Models
{
	/// <summary>
	/// Cuerpo del Put Autoriza (operaciones de flujo 1..5).
	/// </summary>
	public class SC_MOVIMIENTO_PERSONAL_AUTORIZAParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }

		/// <summary>Unidad del documento para el motor; si null el SP toma la unidad propuesta.</summary>
		public int? CORR_UNIDAD_DOCUMENTO { get; set; }

		/// <summary>1=GUARDAR 2=ENVIAR 3=APROBAR 4=DEVOLVER 5=RECHAZAR</summary>
		public int OPERACION { get; set; }

		public int? CORR_ACCION { get; set; }
		public string OBSERVACION { get; set; }
	}
}
