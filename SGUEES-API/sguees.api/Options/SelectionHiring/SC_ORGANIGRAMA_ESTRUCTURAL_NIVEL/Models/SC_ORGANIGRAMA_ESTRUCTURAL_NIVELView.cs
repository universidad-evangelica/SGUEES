using System;

namespace sguees.Models
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_NIVELView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_NIVEL { get; set; }
        public string NOMBRE_NIVEL { get; set; }
        public int CANTIDAD_CARACTERES { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public int EN_USO { get; set; } // 1=En uso, 0=No usado
    }
}