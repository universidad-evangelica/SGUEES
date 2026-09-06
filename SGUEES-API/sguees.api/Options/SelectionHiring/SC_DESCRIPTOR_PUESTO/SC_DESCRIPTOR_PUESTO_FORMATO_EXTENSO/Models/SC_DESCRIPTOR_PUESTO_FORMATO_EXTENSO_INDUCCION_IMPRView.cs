namespace SGUEES.Models
{
    // Qué hace: inducción/entrenamiento para impresión Formato extenso (detalle).
    // Cómo: mapea result set 10 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_INDUCCION_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_INDUCCION { get; set; }
        public string NOMBRE_INDUCCION { get; set; }
        public string TIEMPO_INDUCCION { get; set; }
    }
}
