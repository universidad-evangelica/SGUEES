using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta de actividades ligadas a una función.
    public class SC_DESCRIPTOR_FUNCION_ACTIVIDADParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public int CORR_ACTIVIDAD { get; set; }
    }
}
