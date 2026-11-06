using System;

namespace sguees.Models
{
    public class ACA_CONFIG_CICLOSView
    {
        public int CORR_CICLO_ACADEMICO { get; set; }
        public string NOMBRE_AREA { get; set; }
        public short ANIO { get; set; }
        public byte NUMERO_PERIODO { get; set; }
        public string ESTADO { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public bool PARTICIPA_FACULTAD { get; set; }
        public bool PARTICIPA_SEDE { get; set; }
        public int? CARRERAS_INCLUIDAS { get; set; }
        public int? PENDIENTES { get; set; }
    }
}
