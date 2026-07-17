using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta de experiencia requerida del perfil.
    public class SC_PERFIL_PUESTO_EXPERIENCIAParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EXPERIENCIA { get; set; }
    }
}
