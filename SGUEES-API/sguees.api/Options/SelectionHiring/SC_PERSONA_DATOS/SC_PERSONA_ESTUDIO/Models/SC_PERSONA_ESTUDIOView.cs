using System;
namespace sguees.Models
{
    public class SC_PERSONA_ESTUDIOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_ESTUDIO { get; set; }
        public string NIVEL { get; set; }
        public string INSTITUCION { get; set; }
        public DateTime? DESDE { get; set; }
        public DateTime? HASTA { get; set; }
        public string TITULO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
