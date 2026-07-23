using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_PERFIL_PUESTO_COMPETENCIAS_TECNICAS
    // por empresa, descriptor, perfil o identificador de la competencia.
    public class SC_PERFIL_PUESTO_COMPETENCIAS_TECNICASParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO_COMPETENCIAS_TECNICAS { get; set; }
    }
}
