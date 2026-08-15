using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO: riesgos del puesto del descriptor.
    public class SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        // Snapshot: nombre del riesgo guardado en el registro.
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        public string INFORMACION { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este riesgo. Forma parte de la llave compuesta.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo de riesgos del cual se copió este registro. Forma parte de la llave compuesta.
        public int CORR_RIESGO_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
