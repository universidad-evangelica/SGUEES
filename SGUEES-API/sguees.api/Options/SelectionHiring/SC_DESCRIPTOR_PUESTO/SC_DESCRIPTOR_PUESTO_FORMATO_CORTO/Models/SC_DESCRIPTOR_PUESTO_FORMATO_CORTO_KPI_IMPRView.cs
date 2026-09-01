namespace SGUEES.Models
{
    // Qué hace: indicador de desempeño para impresión Formato corto.
    // Cómo: mapea result set 4 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_KPI_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_KPI_FUNCION { get; set; }
        public string NOMBRE_INDICADOR { get; set; }
        public int? META { get; set; }
        public int? CORR_FRECUENCIA { get; set; }
        public string NOMBRE_FRECUENCIA { get; set; }
    }
}
