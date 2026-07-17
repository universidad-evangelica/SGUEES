using System;

namespace SGUEES.Models
{
    // Proyección de lectura de relación laboral del descriptor.
    public class SC_DESCRIPTOR_RELACION_LABORALView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RELACION_LABORAL { get; set; }
        public string TIPO_RELACION { get; set; }
        public string PUESTO_AREA { get; set; }
        public string MOTIVO_RELACION { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
