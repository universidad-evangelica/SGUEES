using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO: riesgos del puesto asociados
    // a un descriptor de puesto (se precargan desde el catálogo al crear el descriptor).
    public class SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_RIESGO { get; set; }
        // Snapshot: nombre del riesgo tomado del catálogo al momento de precargarlo/guardarlo.
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        public string INFORMACION { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este riesgo.
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo de riesgos del cual se copió este registro.
        public int? CORR_RIESGO_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
