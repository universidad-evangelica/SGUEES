namespace SGUEES.Models
{
    // Qué hace: empleado seleccionado para el PDF del descriptor.
    // Cómo: mapea V_SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPR; el SP deja una sola fila.
    public class SC_DESCRIPTOR_PUESTO_EMPLEADO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_EMPLEADO { get; set; }
        public string NOMBRE_EMPLEADO { get; set; }
    }
}
