namespace SGUEES.Models
{
    // Qué hace: funciones CLAVE y SECUNDARIA agregadas para Formato corto.
    // Cómo: mapea result set 3 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_CORTO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_CORTO_FUNCIONES_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public string LISTA_FUNCIONES_CLAVE { get; set; }
        public string LISTA_FUNCIONES_SECUNDARIA { get; set; }
    }
}
