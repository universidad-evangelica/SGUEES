namespace SGUEES.Models
{
	/// <summary>
	/// Cuerpo del Put Confirmar (confirmación TH).
	/// </summary>
	public class SC_MOVIMIENTO_PERSONAL_CONFIRMAParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_MOVIMIENTO_PERSONAL { get; set; }

		/// <summary>Fecha en que el movimiento se hace oficial.</summary>
		public System.DateTime? FECHA_EFECTIVA { get; set; }
	}
}
