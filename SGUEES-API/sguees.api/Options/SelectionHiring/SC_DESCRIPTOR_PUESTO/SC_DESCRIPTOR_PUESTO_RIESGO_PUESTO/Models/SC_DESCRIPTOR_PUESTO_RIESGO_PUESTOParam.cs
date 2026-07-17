using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta de riesgos del puesto en el descriptor.
    public class SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_DESCRIPTOR_RIESGO { get; set; }
    }
}
