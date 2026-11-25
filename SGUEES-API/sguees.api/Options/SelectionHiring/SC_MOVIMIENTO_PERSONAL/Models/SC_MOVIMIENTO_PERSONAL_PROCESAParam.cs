namespace SGUEES.Models
{
	/// <summary>Parámetros para marcar el movimiento como procesado por Talento Humano.</summary>
	public class SC_MOVIMIENTO_PERSONAL_PROCESAParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }
		public System.DateTime? FECHA_EFECTIVA { get; set; }
	}
}
