namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO
{
	// Qué hace: competencia conductual del perfil para impresión Formato corto (1 fila por registro).
	public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES_FORMATO_CORTO_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public int CORR_PERFIL_PUESTO { get; set; }
		public int CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
		public string CODIGO_TIPO_PUESTO { get; set; }
		public string NOMBRE_COMPETENCIAS_CONDUCTUALES { get; set; }
		public string DESCRIPCION { get; set; }
	}
}
