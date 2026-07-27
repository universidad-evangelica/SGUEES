using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO: responsabilidades del cargo
    // del descriptor de puesto.
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOView
    {
        public int CORR_EMPRESA { get; set; }
        // Snapshot: nombre de la responsabilidad guardado en el registro.
        public string NOMBRE_RESPONSABILIDAD { get; set; }
        public string INFORMACION { get; set; }
        // Indica si la responsabilidad aplica o no al descriptor (por ejemplo "SI"/"NO").
        public string APLICA_DESCRIPTOR { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta responsabilidad. Forma parte de la llave compuesta.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo de responsabilidades del cual se copió este registro. Forma parte de la llave compuesta.
        public int CORR_RESPONSABILIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
