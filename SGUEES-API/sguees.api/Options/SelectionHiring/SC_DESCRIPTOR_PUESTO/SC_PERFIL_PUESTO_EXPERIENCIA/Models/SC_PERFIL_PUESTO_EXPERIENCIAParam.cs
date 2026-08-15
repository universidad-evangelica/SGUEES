using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_PERFIL_PUESTO_EXPERIENCIA por empresa,
    // descriptor, perfil o identificador del requisito.
    public class SC_PERFIL_PUESTO_EXPERIENCIAParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_EXPERIENCIA { get; set; }
    }
}
