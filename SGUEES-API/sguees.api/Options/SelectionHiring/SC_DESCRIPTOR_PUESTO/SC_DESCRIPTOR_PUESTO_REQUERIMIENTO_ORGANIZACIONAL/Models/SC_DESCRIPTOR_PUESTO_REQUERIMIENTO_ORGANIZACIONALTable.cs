using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL: requerimientos
    // organizacionales asociados a un descriptor de puesto (se precargan desde el catálogo al crear el descriptor).
    public class SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        // Snapshot: descripción del requerimiento tomada del catálogo al momento de precargarlo/guardarlo.
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
