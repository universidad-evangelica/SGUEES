using System;

namespace sguees.Models
{
    public class ACA_PERIODOConsulta
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int ANIO { get; set; }
        public int NUMERO_PERIODO { get; set; }
        public DateTime? FECHA_REFERENCIA { get; set; }
    }
}
