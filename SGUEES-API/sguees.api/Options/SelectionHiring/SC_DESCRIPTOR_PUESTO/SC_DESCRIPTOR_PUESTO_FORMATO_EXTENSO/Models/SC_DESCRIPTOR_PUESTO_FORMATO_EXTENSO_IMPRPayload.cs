using System.Collections.Generic;

namespace SGUEES.Models
{
    // Qué hace: paquete de datos para PDF Formato extenso (bloques del SP).
    // Cómo: Encabezado trae logos mergeados; RPT separa GEN_PARAMETRO al armar el DataSet.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRPayload
    {
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_IMPRView> Encabezado { get; set; }
        public List<SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPRView> Funciones { get; set; }
    }
}
