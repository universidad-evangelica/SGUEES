using System;

namespace SGUEES.Models
{
    public class SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_RIESGO { get; set; }
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        public string INFORMACION { get; set; }
        public bool? ES_LISTA { get; set; }
        public int? CORR_DESCRIPTOR_PUESTO { get; set; }
        public int? CORR_RIESGO_PUESTO { get; set; }
        public string USUARIO_CREA { get; set; }
        public string ESTACION_CREA { get; set; }
        public DateTime? FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public string ESTACION_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
