using eFramework.Data;

namespace sguees.Models
{
    public class ACA_ASIGNATURASView : ACA_ASIGNATURASTable
    {
        public string NOMBRE_TIPO_PRACTICA { get; set; }
        public bool HABILITA_COBROS_ADICIONALES { get; set; }
        public int CORR_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public string NOMBRE_PERIODO { get; set; }
        public int DURACION_MESES { get; set; }
        public int CANTIDAD_PLANES { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
