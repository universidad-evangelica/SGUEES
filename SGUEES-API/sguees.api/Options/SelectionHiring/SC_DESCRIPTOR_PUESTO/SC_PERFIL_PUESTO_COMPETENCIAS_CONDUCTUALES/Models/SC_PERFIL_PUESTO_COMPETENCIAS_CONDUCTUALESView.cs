using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES: competencias conductuales
    // del perfil del descriptor de puesto.
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES { get; set; }
        // Código del tipo de puesto usado para filtrar qué competencias conductuales aplican.
        public string CODIGO_TIPO_PUESTO { get; set; }
        // Snapshot: nombre de la competencia conductual guardado en el registro.
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
