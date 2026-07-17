using eFramework.Data;

namespace SGUEES.Models
{
    // filtros de consulta de SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES.
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES { get; set; }
    }
}
