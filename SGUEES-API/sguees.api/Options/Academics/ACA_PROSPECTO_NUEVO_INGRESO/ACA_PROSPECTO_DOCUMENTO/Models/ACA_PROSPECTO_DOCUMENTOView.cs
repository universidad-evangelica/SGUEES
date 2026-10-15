namespace sguees.Models
{
    // Qué hace: fila de V_ACA_PROSPECTO_DOCUMENTO_NUEVO_INGRESO.
    // Cómo lo hace: el tipo coincide con la vista (tinyint → byte).
    public class ACA_PROSPECTO_DOCUMENTOView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PROSPECTO { get; set; }
        public int CORR_DOCUMENTO_ADMISION { get; set; }
        public string NOMBRE_DOCUMENTO { get; set; }
        public string CODIGO { get; set; }
        public bool OBLIGATORIO { get; set; }
        public int ORDEN { get; set; }
        public string FORMATOS_PERMITIDOS { get; set; }
        public byte TAMANO_MAXIMO_MB { get; set; }
        public int? CORR_PROSPECTO_DOCUMENTO { get; set; }
        public string NOMBRE_ARCHIVO { get; set; }
        public System.DateTime? FECHA_CARGA { get; set; }
        public string ESTADO_REVISION { get; set; }
    }
}
