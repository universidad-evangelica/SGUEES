namespace SGUEES.Models
{
    // Qué hace: función CLAVE + actividad para impresión Formato extenso (fila plana).
    // Cómo: mapea result set 4; Crystal agrupa por CORR_FUNCION / NUM_ORDEN_FUNCION.
    public class SC_DESCRIPTOR_PUESTO_FORMATO_EXTENSO_FUNCIONES_ACTIVIDADES_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public string NOMBRE_FUNCION { get; set; }
        public string TIPO_FUNCION { get; set; }
        public int NUM_ORDEN_FUNCION { get; set; }
        public int CORR_ACTIVIDAD { get; set; }
        public string NOMBRE_ACTIVIDAD { get; set; }
        public int NUM_ORDEN_ACTIVIDAD { get; set; }
    }
}
