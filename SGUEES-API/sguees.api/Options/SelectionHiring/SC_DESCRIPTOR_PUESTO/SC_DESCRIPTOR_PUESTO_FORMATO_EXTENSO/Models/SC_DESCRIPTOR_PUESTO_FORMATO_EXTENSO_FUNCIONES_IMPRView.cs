namespace SGUEES.Models
{
    // Qué hace: función CLAVE del descriptor para impresión Formato extenso (1 fila).
    // Cómo: mapea result set 3 del SP PRAL_IMPR_SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public string NOMBRE_FUNCION { get; set; }
        public string TIPO_FUNCION { get; set; }
        public int NUM_ORDEN { get; set; }
    }
}
