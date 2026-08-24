namespace SGUEES.Models
{
    // Qué hace: flags de acciones de flujo visibles para el usuario de sesión.
    // Cómo: resultado de PRAL_DATA_SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJO.
    public class SC_DESCRIPTOR_PUESTO_ACCIONES_FLUJOView
    {
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public string NOMBRE_ESTADO { get; set; }
        public int? CORR_PASO_ACTUAL { get; set; }
        public string NOMBRE_PASO { get; set; }
        public bool ES_DESTINATARIO_PASO { get; set; }
        public bool PUEDE_SOLICITAR { get; set; }
        public bool PUEDE_APROBAR { get; set; }
        public bool PUEDE_OBSERVAR { get; set; }
        public bool PUEDE_INACTIVAR { get; set; }
        public bool PUEDE_REACTIVAR { get; set; }
    }
}
