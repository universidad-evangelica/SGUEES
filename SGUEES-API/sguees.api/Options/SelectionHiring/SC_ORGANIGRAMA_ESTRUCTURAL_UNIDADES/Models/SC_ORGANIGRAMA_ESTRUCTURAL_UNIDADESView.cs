using System;

namespace sguees.Models
{
    public class SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADESView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string CODIGO_UNIDAD { get; set; }
        public string NOMBRE_UNIDAD { get; set; }
        public int CORR_NIVEL { get; set; }
        public string NOMBRE_NIVEL { get; set; }
        public int? CORR_UNIDAD_PADRE { get; set; }
        public string NOMBRE_UNIDAD_PADRE { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
        public int TIENE_HIJAS { get; set; }   // 1=Tiene hijas, 0=No tiene
        public int TIENE_JEFES { get; set; }   // 1=Tiene jefes, 0=No tiene
    }
}