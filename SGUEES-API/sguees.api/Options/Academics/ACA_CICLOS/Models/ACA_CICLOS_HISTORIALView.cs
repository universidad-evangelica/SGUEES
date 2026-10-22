using System;

namespace sguees.Models
{
    public class ACA_CICLOS_HISTORIALView
    {
        public long ID_BITACORA { get; set; }
        public string OPERACION { get; set; }
        public string USUARIO { get; set; }
        public string ESTACION { get; set; }
        public DateTime FECHA { get; set; }
    }
}
