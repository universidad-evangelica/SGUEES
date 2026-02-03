using System.Collections.Generic;
using sguees.api.Shared;

namespace sguees.Models
{
    public class SEG_USUARIO_LOGINView
    {
        public string LOGIN_SISTEMA { get; set; }
        public string CODIGO_SUITE { get; set; }
        public UserType TIPO_USUARIO { get; set; }
        public UserStatus ESTADO_USUARIO { get; set; }
        public string TOKEN { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string NOMBRE_EMPRESA { get; set; }
        public bool REQUIERE_CAMBIO_CLAVE { get; set; }
        //public List<SEG_USUARIO_PERMISOView> OPCIONES { get; set; }
        public List<SEG_USUARIO_MENUView> OPCIONES { get; set; }
    }
}
