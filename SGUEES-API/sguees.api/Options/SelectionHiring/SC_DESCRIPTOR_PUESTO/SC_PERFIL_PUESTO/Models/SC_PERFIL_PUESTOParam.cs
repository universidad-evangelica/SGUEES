using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta del perfil asociado al descriptor.
    public class SC_PERFIL_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
    }
}
