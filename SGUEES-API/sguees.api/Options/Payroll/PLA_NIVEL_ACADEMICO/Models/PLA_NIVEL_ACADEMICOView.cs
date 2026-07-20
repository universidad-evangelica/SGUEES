using System;

namespace SGUEES.Models
{
    // Qué hace: representa una fila leída desde V_PLA_NIVEL_ACADEMICO para consultas.
    public class PLA_NIVEL_ACADEMICOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_NIVEL_ACADEMICO { get; set; }
        public string NOMBRE_NIVEL_ACADEMICO { get; set; }
        public bool? ESTADO_NIVEL_ACADEMICO { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
