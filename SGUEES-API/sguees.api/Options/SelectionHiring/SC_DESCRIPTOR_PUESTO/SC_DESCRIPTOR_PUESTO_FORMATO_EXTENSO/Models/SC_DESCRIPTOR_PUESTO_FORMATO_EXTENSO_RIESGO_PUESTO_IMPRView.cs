namespace SGUEES.Models
{
    // Qué hace: riesgo del puesto para impresión Formato extenso (detalle).
    // Cómo: mapea result set 9 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RIESGO_PUESTO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RIESGO_PUESTO { get; set; }
        public string NOMBRE_RIESGO_PUESTO { get; set; }
        public string INFORMACION { get; set; }
    }
}
