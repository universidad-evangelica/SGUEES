using System;

namespace sguees.Models
{
    public class ACA_CICLOS_OFERTAView
    {
        public int CORR_CICLO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_CARRERA { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public int? CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_PLAN_ACADEMICO { get; set; }
        public string CODIGO_PLAN { get; set; }
        public short ANIO_PLAN { get; set; }
        public int CORR_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public DateTime FECHA_INICIO { get; set; }
        public DateTime FECHA_FIN { get; set; }
        public DateTime FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime FECHA_FIN_INSCRIPCION { get; set; }
        public long? RN { get; set; }
    }
}
