namespace SGUEES.Models
{
    // Qué hace: perfil del puesto para impresión Formato extenso.
    // Cómo: mapea result set 11 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_PERFIL_PUESTO_FORMATO_EXTENSO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public byte? EDAD_MINIMA { get; set; }
        public byte? EDAD_MAXIMA { get; set; }
        public string SEXO { get; set; }
        public string ESTADO_FAMILIAR { get; set; }
        public bool? LICENCIA { get; set; }
        public int? CORR_DISPONIBILIDAD_HORARIO { get; set; }
        public string NOMBRE_DISPONIBILIDAD_HORARIO { get; set; }
        public int? CORR_TIPO_MODALIDAD { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
    }
}
