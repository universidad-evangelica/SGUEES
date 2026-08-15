using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONAL
    // por empresa, descriptor o identificador del requerimiento del catálogo (llave compuesta).
    public class SC_DESCRIPTOR_PUESTO_REQUERIMIENTO_ORGANIZACIONALParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_REQUERIMIENTO_ORGANIZACIONAL { get; set; }
    }
}
