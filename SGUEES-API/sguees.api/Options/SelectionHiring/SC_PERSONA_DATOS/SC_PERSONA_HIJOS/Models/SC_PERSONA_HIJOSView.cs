using System;
namespace sguees.Models
{
    public class SC_PERSONA_HIJOSView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_HIJO { get; set; }
        public string NOMBRE { get; set; }
        public int? EDAD { get; set; }
        public string SEXO { get; set; }
        public DateTime? FECHA_NACIMIENTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
