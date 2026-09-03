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
		public List<SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_INDUCCION_IMPRView> Inducciones { get; set; }
		public List<SC_PERFIL_PUESTO_FORMATO_CORTO_IMPRView> PerfilPuesto { get; set; }
		public List<SC_PERFIL_PUESTO_EDUCACION_FORMATO_CORTO_IMPRView> PerfilPuestoEducacion { get; set; }
		public List<SC_PERFIL_PUESTO_EXPERIENCIA_FORMATO_CORTO_IMPRView> PerfilPuestoExperiencia { get; set; }
		public List<SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS_FORMATO_CORTO_IMPRView> PerfilPuestoCompetenciasTecnicas { get; set; }
		public List<SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES_FORMATO_CORTO_IMPRView> PerfilPuestoCompetenciasConductuales { get; set; }
	}
}
