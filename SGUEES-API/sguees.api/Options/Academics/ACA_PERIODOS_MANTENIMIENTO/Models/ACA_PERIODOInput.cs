using System;
using eFramework.Data;

namespace sguees.Models
{
    public class ACA_PERIODOInput : BaseEntity
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PERIODO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int? CORR_FACULTAD { get; set; }
        public int? CORR_CARRERA { get; set; }
        public int ANIO { get; set; }
        public int? NUMERO_PERIODO { get; set; }
        public DateTime? FECHA_INICIO { get; set; }
        public DateTime? FECHA_FIN { get; set; }
        public DateTime? FECHA_INICIO_INSCRIPCION { get; set; }
        public DateTime? FECHA_FIN_INSCRIPCION { get; set; }
    }
}
