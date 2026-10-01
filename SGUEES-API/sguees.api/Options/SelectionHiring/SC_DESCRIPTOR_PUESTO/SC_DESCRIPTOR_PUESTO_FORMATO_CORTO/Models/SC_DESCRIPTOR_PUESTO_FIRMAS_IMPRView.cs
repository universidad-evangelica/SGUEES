namespace SGUEES.Models
{
    // Qué hace: últimas firmas del descriptor para el PDF (una fila, dos nombres).
    // Cómo: mapea V_SC_DESCRIPTOR_PUESTO_FIRMAS_IMPR. Las fechas ya vienen como texto.
    public class SC_DESCRIPTOR_PUESTO_FIRMAS_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public string NOMBRE_FIRMANTE_JI { get; set; }
        public string TIPO_ACTOR_JI { get; set; }
        public string FECHA_FIRMA_JI { get; set; }
        public string NOMBRE_FIRMANTE_JTH { get; set; }
        public string TIPO_ACTOR_JTH { get; set; }
        public string FECHA_FIRMA_JTH { get; set; }
    }
}
