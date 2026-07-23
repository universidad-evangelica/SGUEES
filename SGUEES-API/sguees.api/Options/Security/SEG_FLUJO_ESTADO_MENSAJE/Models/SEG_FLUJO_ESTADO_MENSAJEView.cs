using System;

namespace sguees.Models
{
    public class SEG_FLUJO_ESTADO_MENSAJEView
    {
        // Campos de la tabla principal
        public int CORR_EMPRESA { get; set; }
        public int CORR_ESTADO_MENSAJE { get; set; }
        public int CORR_PASO { get; set; }
        public int CORR_ESTADO { get; set; }
        public int? CORR_ACTOR { get; set; }
        public string LOGIN_SISTEMA { get; set; }
        public string MENSAJE { get; set; }
        public bool ACTIVO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }

        // Nuevos campos de los JOINs (solo lectura)
        public string NOMBRE_PASO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public string NOMBRE_ACTOR { get; set; }
    }
}