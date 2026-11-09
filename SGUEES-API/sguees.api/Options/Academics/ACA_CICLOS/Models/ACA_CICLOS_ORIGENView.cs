using System;

namespace sguees.Models
{
    public class ACA_CICLOS_ORIGENView
    {
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public int? CORR_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public int? CORR_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime FECHA_FIN { get; set; }
        public DateTime FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime FECHA_FIN_INSCRIPCION { get; set; }
        public bool ACTIVO { get; set; }
        public bool ES_GESTIONADO_CICLO { get; set; }
    }
}
