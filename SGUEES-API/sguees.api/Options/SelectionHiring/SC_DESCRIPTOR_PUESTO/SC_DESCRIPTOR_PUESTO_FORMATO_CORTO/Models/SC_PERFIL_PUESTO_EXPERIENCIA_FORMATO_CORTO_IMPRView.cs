namespace SGUEES.Models
{
    // Qué hace: experiencia del perfil de puesto para impresión Formato corto.
    // Cómo: mapea result set 9 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.
    public class SC_PERFIL_PUESTO_EXPERIENCIA_FORMATO_CORTO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EXPERIENCIA { get; set; }
        public string REQUISITO { get; set; }
        public string TIPO_REQUERIDO { get; set; }
    }
}
