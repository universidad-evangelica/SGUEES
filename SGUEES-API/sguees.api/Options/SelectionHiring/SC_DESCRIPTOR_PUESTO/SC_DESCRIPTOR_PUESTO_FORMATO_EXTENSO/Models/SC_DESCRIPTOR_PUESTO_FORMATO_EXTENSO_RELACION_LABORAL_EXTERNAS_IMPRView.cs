namespace SGUEES.Models
{
    // Qué hace: relación laboral EXTERNA para impresión Formato extenso.
    // Cómo: mapea result set 7 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_RELACION_LABORAL_EXTERNAS_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RELACION_LABORAL { get; set; }
        public string TIPO_RELACION { get; set; }
        public string PUESTO_AREA { get; set; }
        public string MOTIVO_RELACION { get; set; }
    }
}
