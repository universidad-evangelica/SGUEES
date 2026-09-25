namespace sguees.Models
{
    // Qué hace: fila de dbo.V_ACA_PROSPECTO_BECA_RESPUESTA (respuesta contestada y su puntaje).
    public class ACA_PROSPECTO_BECA_RESPUESTAView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_RESPUESTA_BECA { get; set; }
        public int ORDEN_SECCION { get; set; }
        public string NOMBRE_SECCION { get; set; }
        public int ORDEN_PREGUNTA { get; set; }
        public string TEXTO_PREGUNTA { get; set; }
        public string TIPO_RESPUESTA { get; set; }
        public string RESPUESTA { get; set; }
        public decimal PUNTAJE_OBTENIDO { get; set; }
        public decimal PORCENTAJE_APLICADO { get; set; }
    }
}
