using System;

namespace sguees.Models
{
    public class ACA_PERIODOHistorial : ACA_PERIODOView
    {
        public long ID_BITACORA { get; set; }
        public string TIPO_CAMBIO { get; set; }
        public string USUARIO_CAMBIO { get; set; }
        public DateTime FECHA_CAMBIO { get; set; }
    }
}
