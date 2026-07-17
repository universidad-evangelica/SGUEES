using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta del descriptor de puesto.
    public class SC_DESCRIPTOR_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
    }
}
