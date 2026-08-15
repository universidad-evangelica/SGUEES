using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL: requerimientos
    // organizacionales del descriptor de puesto.
    public class SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALView
    {
        public int CORR_EMPRESA { get; set; }
        // Snapshot: descripción del requerimiento guardada en el registro.
        public string DESCRIPCION { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este requerimiento. Forma parte de la llave compuesta.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo de requerimientos organizacionales del cual se copió este registro. Forma parte de la llave compuesta.
        public int CORR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
