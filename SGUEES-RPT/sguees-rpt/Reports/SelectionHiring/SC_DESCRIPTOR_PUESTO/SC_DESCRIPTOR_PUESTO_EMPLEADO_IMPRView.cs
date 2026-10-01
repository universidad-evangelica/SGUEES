namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO
{
	// Qué hace: empleado seleccionado para el PDF (corto y extenso).
	// Cómo: misma fila que V_SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPR.
	public class SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public string NOMBRE_EMPLEADO { get; set; }
	}
}
