using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES
    // por empresa, descriptor, perfil o identificador de la competencia del catálogo (llave compuesta).
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALESParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_COMPETENCIAS_CONDUCTUALES { get; set; }
    }
}
