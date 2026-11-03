using System;

namespace sguees.Models
{
    public class ACA_CICLOS_PLANESView
    {
        public int CORR_CARRERA { get; set; }
        public int? CORR_PLAN_ACADEMICO { get; set; }
        public string CODIGO_PLAN { get; set; }
        public short? ANIO_PLAN { get; set; }
        public int? CORR_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public DateTime? FECHA_VIGENCIA_INICIO { get; set; }
        public DateTime? FECHA_VIGENCIA_FIN { get; set; }
        public string MOTIVO_PLAN { get; set; }
        public long? RN { get; set; }
        public bool? ES_ELEGIBLE { get; set; }
        public bool? ES_APLICABLE { get; set; }
    }
}
