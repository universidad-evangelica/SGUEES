using System.Collections.Generic;

namespace sgueesRpt.Reports.SelectionHiring.SC_DESCRIPTOR_PUESTO.SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO
{
	// Qué hace: paquete API → RPT para PDF Formato extenso.
	public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload
	{
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRView> Encabezado { get; set; }
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPRView> Funciones { get; set; }
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_ACTIVIDADES_IMPRView> FuncionesActividades { get; set; }
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RESPONSABILIDAD_CARGO_IMPRView> Responsabilidades { get; set; }
	}
}
