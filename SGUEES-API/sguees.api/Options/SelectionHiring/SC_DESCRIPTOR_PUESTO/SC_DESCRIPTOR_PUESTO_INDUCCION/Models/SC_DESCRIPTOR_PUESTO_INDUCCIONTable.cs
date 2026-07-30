using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Qué hace: campos de escritura de la tabla SC_DESCRIPTOR_PUESTO_INDUCCION: inducciones asociadas
    // a un descriptor de puesto (se agregan desde el catálogo SC_INDUCCION al registrar cada fila).
    public class SC_DESCRIPTOR_PUESTO_INDUCCIONTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta inducción. Forma parte de la llave compuesta.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al catálogo SC_INDUCCION del cual se copió este registro. Forma parte de la llave compuesta.
        public int CORR_INDUCCION { get; set; }
        // Snapshot: nombre de la inducción tomado del catálogo al momento de agregarla.
        public string NOMBRE_INDUCCION { get; set; }
        // Snapshot: cantidad de tiempo de la inducción tomada del catálogo.
        public int? TIEMPO_INDUCCION { get; set; }
        // Snapshot: unidad del tiempo de inducción ('Semanas' o 'Meses') tomada del catálogo.
        public string UNIDAD_TIEMPO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
