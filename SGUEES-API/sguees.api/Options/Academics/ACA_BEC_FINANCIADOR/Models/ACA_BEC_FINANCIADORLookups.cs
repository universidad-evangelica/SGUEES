namespace SGUEES.Models
{
    public class ACA_BEC_FINANCIADOR_TIPOLookup
    {
        public int CORR_BECA { get; set; }
        public string CODIGO_BECA { get; set; }
        public string NOMBRE_BECA { get; set; }
        public string ESTADO_BECA { get; set; }
        public bool? ACTIVO { get; set; }
    }

    public class ACA_BEC_FINANCIADOR_ENTIDADLookup
    {
        public int CORR_ENTIDAD_FINANCIADORA { get; set; }
        public string CODIGO_ENTIDAD { get; set; }
        public string NOMBRE_ENTIDAD { get; set; }
        public string TIPO_ENTIDAD { get; set; }
        public bool? ACTIVO { get; set; }
    }
}
