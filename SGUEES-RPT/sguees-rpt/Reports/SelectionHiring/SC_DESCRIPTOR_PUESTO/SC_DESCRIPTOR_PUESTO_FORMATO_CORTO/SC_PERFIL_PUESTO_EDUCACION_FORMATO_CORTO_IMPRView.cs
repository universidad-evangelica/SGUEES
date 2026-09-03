namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO
{
	// Qué hace: educación del perfil de puesto para impresión Formato corto (1 fila por registro).
	public class SC_PERFIL_PUESTO_EDUCACION_FORMATO_CORTO_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public int CORR_PERFIL_PUESTO { get; set; }
		public int CORR_EDUCACION { get; set; }
		public string REQUISITO { get; set; }
		public string ESPECIFICACIONES { get; set; }
		public string TIPO_REQUERIDO { get; set; }
	}
}
