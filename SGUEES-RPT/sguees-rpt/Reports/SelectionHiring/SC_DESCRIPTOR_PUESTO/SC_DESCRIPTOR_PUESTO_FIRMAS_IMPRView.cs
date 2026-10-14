namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO
{
	// Qué hace: últimas firmas para el PDF (una fila con jefe inmediato y jefe de TH).
	// Cómo: misma fila que V_SC_DESCRIPTOR_PUESTO_FIRMAS_IMPR.
	public class SC_DESCRIPTOR_PUESTO_FIRMAS_IMPRView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DESCRIPTOR_PUESTO { get; set; }
		public string NOMBRE_FIRMANTE_JI { get; set; }
		public string TIPO_ACTOR_JI { get; set; }
		public string FECHA_FIRMA_JI { get; set; }
		public string NOMBRE_FIRMANTE_JTH { get; set; }
		public string TIPO_ACTOR_JTH { get; set; }
		public string FECHA_FIRMA_JTH { get; set; }
	}
}
