using System;

namespace sguees.Models
{
    // Qué hace: una fila del historial del flujo 104 de la solicitud.
    // Cómo lo hace: USUARIO es el CIF cuando el paso lo ejecutó PORTAL_ADMISION; si no, el login del analista.
    public class ACA_PROSPECTO_BITACORA_FLUJOView
    {
        public int CORR_BITACORA { get; set; }
        public int CORR_INSTANCIA { get; set; }
        public string NOMBRE_PASO { get; set; }
        public string ESTADO_DESTINO { get; set; }
        public string USUARIO { get; set; }
        public string COMENTARIO { get; set; }
        public DateTime FECHA_ACCION { get; set; }
    }
}
