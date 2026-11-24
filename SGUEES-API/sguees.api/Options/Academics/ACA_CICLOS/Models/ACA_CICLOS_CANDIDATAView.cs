namespace sguees.Models
{
    public class ACA_CICLOS_CANDIDATAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_AREA_ACADEMICA { get; set; }
        public int CORR_CARRERA { get; set; }
        public int CORR_FACULTAD { get; set; }
        public int? CORR_SEDE { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public bool ES_ELEGIBLE { get; set; }
        public string DIAGNOSTICO { get; set; }
        public string MOTIVO { get; set; }
        public System.DateTime? FECHA_VIGENCIA_INICIO { get; set; }
        public System.DateTime? FECHA_VIGENCIA_FIN { get; set; }
    }
}
