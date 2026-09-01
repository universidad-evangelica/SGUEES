using System.Collections.Generic;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_CORTO
{
	// Qué hace: paquete API → RPT para PDF Formato corto.
	public class SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRPayload
	{
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_IMPRView> Encabezado { get; set; }
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_FUNCIONES_IMPRView> Funciones { get; set; }
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_KPI_IMPRView> Kpis { get; set; }
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_RESPONSABILIDAD_CARGO_IMPRView> Responsabilidades { get; set; }
	}
}
