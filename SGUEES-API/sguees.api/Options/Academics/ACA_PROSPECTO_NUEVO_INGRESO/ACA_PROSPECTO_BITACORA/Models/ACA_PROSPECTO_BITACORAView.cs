using System;

namespace sguees.Models
{
    // Qué hace: una fila de cambios guardados al editar una solicitud de nuevo ingreso.
    // Cómo lo hace: TIPO_PROSPECTO queda en ACA_PROSPECTO y USUARIO es el login que editó.
    public class ACA_PROSPECTO_BITACORAView
    {
        public int CORR_PROSPECTO_BITACORA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string USUARIO { get; set; }
        public string COMENTARIO { get; set; }
        public string TIPO_PROSPECTO { get; set; }
        public DateTime? FECHA_ACCION { get; set; }
    }
}
