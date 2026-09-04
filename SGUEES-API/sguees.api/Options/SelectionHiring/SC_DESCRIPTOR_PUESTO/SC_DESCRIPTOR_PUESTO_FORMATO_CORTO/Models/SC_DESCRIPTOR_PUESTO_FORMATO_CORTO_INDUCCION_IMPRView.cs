namespace SGUEES.Models
{
    // Qué hace: inducción asignada al descriptor para impresión Formato corto.
    // Cómo: mapea result set 6 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_INDUCCION_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_INDUCCION { get; set; }
        public string NOMBRE_INDUCCION { get; set; }
        public string TIEMPO_INDUCCION { get; set; }
    }
}
