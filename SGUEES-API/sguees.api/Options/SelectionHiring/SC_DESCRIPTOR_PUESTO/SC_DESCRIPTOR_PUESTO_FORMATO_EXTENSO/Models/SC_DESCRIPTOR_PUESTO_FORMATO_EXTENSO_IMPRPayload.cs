using System.Collections.Generic;

namespace SGUEES.Models
{
    // Qué hace: paquete de datos para PDF Formato extenso (bloques del SP).
    // Cómo: Encabezado trae logos mergeados; RPT separa GEN_PARAMETRO al armar el DataSet.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload
    {
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRView> Encabezado { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPRView> Funciones { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_ACTIVIDADES_IMPRView> FuncionesActividades { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RESPONSABILIDAD_CARGO_IMPRView> Responsabilidades { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RELACION_LABORAL_INTERNAS_IMPRView> RelacionesInternas { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RELACION_LABORAL_EXTERNAS_IMPRView> RelacionesExternas { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_REQUERIMIENTO_ORGANIZACIONAL_IMPRView> RequerimientosOrganizacionales { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RIESGO_PUESTO_IMPRView> RiesgosPuesto { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_INDUCCION_IMPRView> Inducciones { get; set; }
        public List<SC_PERFIL_PUESTO_FORMATO_EXTENSO_IMPRView> PerfilPuesto { get; set; }
        public List<SC_PERFIL_PUESTO_EDUCACION_FORMATO_EXTENSO_IMPRView> PerfilPuestoEducacion { get; set; }
    }
}
