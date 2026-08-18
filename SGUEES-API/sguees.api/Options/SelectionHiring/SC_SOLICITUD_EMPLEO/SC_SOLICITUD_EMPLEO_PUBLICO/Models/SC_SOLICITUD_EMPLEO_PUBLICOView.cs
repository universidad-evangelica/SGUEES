using System;

namespace sguees.Models
{
    public class SC_SOLICITUD_EMPLEO_PUBLICOView
    {
        public bool VALIDO { get; set; }
        public DateTime? FECHA_EXPIRACION { get; set; }
        public int CORR_TIPO_CONTRATACION { get; set; }
        public string NOMBRE_TIPO_CONTRATACION { get; set; }
        public bool ES_PERMANENTE { get; set; }
    }
}
