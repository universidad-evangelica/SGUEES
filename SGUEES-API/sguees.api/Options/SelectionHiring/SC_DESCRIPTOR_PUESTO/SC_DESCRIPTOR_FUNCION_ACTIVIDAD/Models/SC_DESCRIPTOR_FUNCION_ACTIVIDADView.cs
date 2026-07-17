using System;

namespace SGUEES.Models
{
    // proyeccion de lectura (vista) de SC_DESCRIPTOR_FUNCION_ACTIVIDAD.
    public class SC_DESCRIPTOR_FUNCION_ACTIVIDADView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public int CORR_ACTIVIDAD { get; set; }
        public string NOMBRE_ACTIVIDAD { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
