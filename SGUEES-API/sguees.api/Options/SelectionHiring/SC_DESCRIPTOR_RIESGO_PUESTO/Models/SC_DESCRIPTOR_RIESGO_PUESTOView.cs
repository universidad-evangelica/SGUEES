using System;

namespace SGUEES.Models
{
    public class SC_DESCRIPTOR_RIESGO_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_RIESGO_PUESTO { get; set; }
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        public bool? ESTADO_RIESGO_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
