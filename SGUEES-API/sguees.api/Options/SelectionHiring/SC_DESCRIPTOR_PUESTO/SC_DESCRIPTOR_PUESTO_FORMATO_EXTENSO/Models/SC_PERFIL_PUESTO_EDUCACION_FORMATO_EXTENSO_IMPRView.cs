namespace SGUEES.Models
{
    // Qué hace: educación del perfil de puesto para impresión Formato extenso (detalle).
    // Cómo: mapea result set 12 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_PERFIL_PUESTO_EDUCACION_FORMATO_EXTENSO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EDUCACION { get; set; }
        public string REQUISITO { get; set; }
        public string ESPECIFICACIONES { get; set; }
        public string TIPO_REQUERIDO { get; set; }
    }
}
