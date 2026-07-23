using System;
using eFramework.Data;

namespace SGUEES.Models
{
    // Campos de escritura de la tabla SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES: competencias conductuales
    // asociadas al perfil de un descriptor de puesto (se precargan desde el catálogo por tipo de puesto).
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESTable : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES { get; set; }
        // Código del tipo de puesto usado para filtrar qué competencias conductuales aplican desde el catálogo.
        public string CODIGO_TIPO_PUESTO { get; set; }
        // Snapshot: nombre de la competencia conductual tomado del catálogo al momento de precargarla/guardarla.
        public string NOMBRE_COMPETENCIAS_CONDUCTUALES { get; set; }
        public string DESCRIPCION { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de esta competencia.
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al perfil (SC_PERFIL_PUESTO) dueño de esta competencia.
        public int? CORR_PERFIL_PUESTO { get; set; }
        // FK al catálogo de competencias conductuales del cual se copió este registro.
        public int? CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
