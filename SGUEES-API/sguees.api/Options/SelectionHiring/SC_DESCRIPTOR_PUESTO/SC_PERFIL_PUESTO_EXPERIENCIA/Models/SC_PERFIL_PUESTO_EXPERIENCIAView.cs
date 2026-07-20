using System;

namespace SGUEES.Models
{
    // Campos de lectura de la vista V_SC_PERFIL_PUESTO_EXPERIENCIA: requisitos de experiencia del perfil de puesto.
    public class SC_PERFIL_PUESTO_EXPERIENCIAView
    {
        public int CORR_EMPRESA { get; set; }
        // FK al descriptor de puesto (encabezado) dueño de este requisito.
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        // FK al perfil (SC_PERFIL_PUESTO) dueño de este requisito.
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EXPERIENCIA { get; set; }
        public string REQUISITO { get; set; }
        // Indica si el requisito es OBLIGATORIO o DESEABLE.
        public string TIPO_REQUERIDO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
