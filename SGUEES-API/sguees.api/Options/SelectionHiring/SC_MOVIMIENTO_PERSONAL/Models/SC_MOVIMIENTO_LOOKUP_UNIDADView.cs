namespace SGUEES.Models
{
	/// <summary>Lookup de unidad para sc-movimiento-personal (PRAL_DATA_SC_UNIDADES_USUARIO).</summary>
	public class SC_MOVIMIENTO_LOOKUP_UNIDADView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_UNIDAD { get; set; }
		public string CODIGO_UNIDAD { get; set; }
		public string NOMBRE_UNIDAD { get; set; }
		/// <summary>CODIGO - NOMBRE (texto snapshot / display).</summary>
		public string DISPLAY_UNIDAD { get; set; }
		public int? CORR_UNIDAD_PADRE { get; set; }
		/// <summary>CODIGO - NOMBRE del padre (Gerencia / Vicerrectoría / Facultad).</summary>
		public string GERENCIA_DISPLAY { get; set; }
	}
}
