namespace sguees.Models
{
    // Qué hace: dice si el usuario de la sesión puede aprobar la solicitud abierta.
    public class ACA_PROSPECTO_ACCION_FLUJOView
    {
        public int CORR_PROSPECTO { get; set; }
        public bool PUEDE_APROBAR { get; set; }
        public bool PUEDE_RECHAZAR { get; set; }
        public bool PUEDE_REVERTIR { get; set; }
    }
}
