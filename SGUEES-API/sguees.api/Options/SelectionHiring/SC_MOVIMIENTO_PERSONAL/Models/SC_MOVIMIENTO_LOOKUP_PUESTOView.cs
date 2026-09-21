namespace SGUEES.Models
{
	/// <summary>Lookup de puesto por unidad (V_GEN_UNIDADES_PUESTO).</summary>
	public class SC_MOVIMIENTO_LOOKUP_PUESTOView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_UNIDAD { get; set; }
		public int CORR_PUESTO { get; set; }
		public string NOMBRE_PUESTO { get; set; }
	}
}
