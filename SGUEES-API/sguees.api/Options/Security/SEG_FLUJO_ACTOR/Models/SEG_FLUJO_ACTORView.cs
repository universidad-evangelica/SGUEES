using System;

namespace sguees.Models
{
    public class SEG_FLUJO_ACTORView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_ACTOR { get; set; }
        public string NOMBRE_ACTOR { get; set; }
        public string DESCRIPCION { get; set; }
        public bool REQUIERE_UNIDAD { get; set; }
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