using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO: responsabilidades del cargo
    // asociadas a un descriptor de puesto (se precargan desde el catálogo al crear el descriptor).
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_RESPONSABILIDAD { get; set; }
        // Snapshot: nombre de la responsabilidad tomado del catálogo al momento de precargarla/guardarla.
        public string NOMBRE_RESPONSABILIDAD { get; set; }
        public string INFORMACION { get; set; }
        // Indica si la responsabilidad aplica o no al descriptor (por ejemplo "SI"/"NO").
        public string APLICA_DESCRIPTOR { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta responsabilidad.
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo de responsabilidades del cual se copió este registro.
        public int? CORR_RESPONSABILIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
