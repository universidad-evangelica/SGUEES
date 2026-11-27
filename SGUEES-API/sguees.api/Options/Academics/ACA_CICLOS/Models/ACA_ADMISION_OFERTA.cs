namespace sguees.Models
{
    public sealed class ACA_ADMISION_OFERTAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_CICLO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public int CORR_FACULTAD { get; set; }
        public string NOMBRE_FACULTAD { get; set; }
        public int CORR_CARRERA { get; set; }
        public string CODIGO_CARRERA { get; set; }
        public string NOMBRE_CARRERA { get; set; }
        public int? CORR_PLAN_ACADEMICO { get; set; }
        public string CODIGO_PLAN { get; set; }
        public int? CORR_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public DateTime? FECHA_VIGENCIA_INICIO { get; set; }
        public DateTime? FECHA_VIGENCIA_FIN { get; set; }
        public bool PUBLICAR_NUEVO_INGRESO { get; set; }
        public bool USA_PERIODOS_VIGENTES { get; set; }
        public byte[] VERSION_CICLO { get; set; }
        public byte[] VERSION_OFERTA { get; set; }
        public bool PUBLICAR_CARRERA { get; set; }
        public bool PUBLICAR_MODALIDAD { get; set; }
        public bool PUBLICAR_PLAN { get; set; }
        public bool CARRERA_ELEGIBLE { get; set; }
        public bool PLAN_ELEGIBLE { get; set; }
        public bool ES_PRINCIPAL { get; set; }
        public string DIAGNOSTICO { get; set; }
    }
    public sealed class ACA_ADMISION_OFERTAInput
    {
        public int CORR_CICLO_ACADEMICO { get; set; }
        public int CORR_SEDE { get; set; }
        public bool PUBLICAR_NUEVO_INGRESO { get; set; }
        public byte[] VERSION_CICLO { get; set; }
        public byte[] VERSION_OFERTA { get; set; }
        public List<ACA_ADMISION_CARRERAInput> CARRERAS { get; set; } = new();
        public List<ACA_ADMISION_MODALIDADInput> MODALIDADES { get; set; } = new();
        public List<ACA_ADMISION_PLANInput> PLANES { get; set; } = new();
    }
    public sealed class ACA_ADMISION_CARRERAInput { public int id { get; set; } public bool publicar { get; set; } }
    public sealed class ACA_ADMISION_PLANInput { public int id { get; set; } public bool publicar { get; set; } }
    public sealed class ACA_ADMISION_MODALIDADInput
    {
        public int carrera { get; set; }
        public int modalidad { get; set; }
        public bool publicar { get; set; }
        public int? principal { get; set; }
    }
}
