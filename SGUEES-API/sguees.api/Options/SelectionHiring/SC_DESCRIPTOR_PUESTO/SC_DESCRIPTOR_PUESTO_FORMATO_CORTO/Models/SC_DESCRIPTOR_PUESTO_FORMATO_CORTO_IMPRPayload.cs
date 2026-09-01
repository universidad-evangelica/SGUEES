using System.Collections.Generic;

namespace SGUEES.Models
{
    // Qué hace: paquete de datos para PDF Formato corto (bloques del SP).
    // Cómo: encabezado trae logos mergeados; RPT separa GEN_PARAMETRO al armar el DataSet.
    //       PerfilPuesto usa vista V_SC_PERFIL_PUESTO_FORMATO_CORTO_IMPR.
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
    }
}
