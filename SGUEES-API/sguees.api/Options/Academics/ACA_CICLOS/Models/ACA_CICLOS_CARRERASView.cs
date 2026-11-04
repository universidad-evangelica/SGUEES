using System;

namespace sguees.Models
{
    public class ACA_CICLOS_CARRERASView
    {
        public int CORR_CICLO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int CORR_CARRERA { get; set; }
        public bool ACTIVO { get; set; }
        public int? CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_EMPRESA { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public bool? SELECCIONADA { get; set; }
        public string DIAGNOSTICO { get; set; }
    }
}
