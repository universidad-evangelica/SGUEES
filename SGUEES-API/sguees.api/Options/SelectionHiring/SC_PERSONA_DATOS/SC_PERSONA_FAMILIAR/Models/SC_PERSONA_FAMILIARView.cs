using System;
namespace sguees.Models
{
    public class SC_PERSONA_FAMILIARView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERSONA_DATOS { get; set; }
        public int CORR_FAMILIAR { get; set; }
        public string TIPO { get; set; }
        public string NOMBRE { get; set; }
        public string DOMICILIO { get; set; }
        public DateTime? FECHA_NACIMIENTO { get; set; }
        public string OCUPACION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime FECHA_ACTU { get; set; }
    }
}
