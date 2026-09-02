namespace SGUEES.Models
{
	/// <summary>Parámetros para consultar/ejecutar asociación solicitud ↔ expediente.</summary>
	public class SC_EXPEDIENTE_ASOCIARParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		/// <summary>Si true, crea el encabezado cuando no existe.</summary>
		public bool CREAR_EXPEDIENTE { get; set; }
	}

	/// <summary>
	/// Datos de control de asociación. El texto para el usuario va en CResult.ErrorMessage (desde el SP).
	/// </summary>
	public class SC_EXPEDIENTE_ASOCIAREstadoView
	{
		/// <summary>
		/// SIN_PERSONA | DUI_NO_COINCIDE | SIN_EXPEDIENTE | PUEDE_ASOCIAR | YA_ASOCIADA | ASOCIADA | ERROR
		/// </summary>
		public string ESTADO { get; set; }
		public int CORR_SOLICITUD_EMPLEO { get; set; }
		public int CORR_EXPEDIENTE_CANDIDATO { get; set; }
	}
}
