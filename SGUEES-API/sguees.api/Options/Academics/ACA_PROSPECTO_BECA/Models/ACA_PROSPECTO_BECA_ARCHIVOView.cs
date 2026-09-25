namespace sguees.Models
{
    // Qué hace: archivo cargado en una pregunta tipo documento de la solicitud de beca.
    public class ACA_PROSPECTO_BECA_ARCHIVOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO_BECA { get; set; }
        public int CORR_RESPUESTA_BECA { get; set; }
        public short ANIO { get; set; }
        public byte? NUMERO_PERIODO { get; set; }
        public string CARPETA { get; set; }
        public int ORDEN_SECCION { get; set; }
        public string NOMBRE_SECCION { get; set; }
        public int ORDEN_PREGUNTA { get; set; }
        public int CORR_PREGUNTA_BECA { get; set; }
        public string TEXTO_PREGUNTA { get; set; }
        public string ARCHIVO_NOMBRE { get; set; }
        public string ARCHIVO_RUTA { get; set; }
    }
}
