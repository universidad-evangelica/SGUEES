namespace SGUEES.Models
{
    // Qué hace: requerimiento organizacional para impresión Formato extenso (detalle).
    // Cómo: mapea result set 8 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_REQUERIMIENTO_ORGANIZACIONAL_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
        public string DESCRIPCION { get; set; }
    }
}
