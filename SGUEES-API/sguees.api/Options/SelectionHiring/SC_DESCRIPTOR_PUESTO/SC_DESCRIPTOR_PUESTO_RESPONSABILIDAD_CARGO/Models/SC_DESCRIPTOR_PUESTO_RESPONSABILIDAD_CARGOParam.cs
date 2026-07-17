using eFramework.Data;

namespace SGUEES.Models
{
    // filtros de consulta de SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGO.
    public class SC_DESCRIPTOR_PUESTO_RESPONSABILIDAD_CARGOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_DESCRIPTOR_RESPONSABILIDAD { get; set; }
        public string FORMATO { get; set; }
    }
}
