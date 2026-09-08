namespace SGUEES.Models
{
    // Qué hace: responsabilidad del cargo para impresión Formato extenso.
    // Cómo: mapea result set 5 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RESPONSABILIDAD_CARGO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RESPONSABILIDAD { get; set; }
        public string NOMBRE_RESPONSABILIDAD { get; set; }
        public string INFORMACION { get; set; }
        public string APLICA_DESCRIPTOR { get; set; }
    }
}
