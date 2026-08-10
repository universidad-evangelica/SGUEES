using System;

namespace SGUEES.Models
{
    // Qué hace: campos de lectura de la vista V_SC_DESCRIPTOR_PUESTO_INDUCCION: inducciones del descriptor.
    public class SC_DESCRIPTOR_PUESTO_INDUCCIONView
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta inducción. Forma parte de la llave compuesta.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo SC_INDUCCION del cual se copió este registro. Forma parte de la llave compuesta.
        public int CORR_INDUCCION { get; set; }
        // Snapshot: nombre de la inducción guardado en el registro.
        public string NOMBRE_INDUCCION { get; set; }
        // Snapshot: duración unida (ej. "2 Semanas") guardada en el registro.
        public string TIEMPO_INDUCCION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
