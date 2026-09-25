namespace SGUEES.Models
{
	/// <summary>Botones de flujo que el usuario de sesión puede ejecutar sobre un movimiento.</summary>
	public class SC_MOVIMIENTO_PERSONAL_ACCIONESView
	{
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public bool PUEDE_ENVIAR { get; set; }
		public bool PUEDE_APROBAR { get; set; }
		public bool PUEDE_DEVOLVER { get; set; }
		public bool PUEDE_RECHAZAR { get; set; }
		public int CORR_UNIDAD_DOCUMENTO { get; set; }
	}
}
