using System;

namespace SGUEES.Models
{
    // Proyección de lectura (vista) del catálogo de tipo de puesto.
    public class PLA_TIPO_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_TIPO_PUESTO { get; set; }
        public string NOMBRE_TIPO_PUESTO { get; set; }
        public string CODIGO_TIPO_PUESTO { get; set; }
        public bool? ESTADO_TIPO_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
    }
}
